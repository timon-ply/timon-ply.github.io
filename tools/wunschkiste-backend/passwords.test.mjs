import test from "node:test";
import assert from "node:assert/strict";
import { createHash, pbkdf2Sync } from "node:crypto";
import worker from "./worker.mjs";
import { createDatabase } from "./sqlite-adapter.mjs";
import { CLIENT_SALT_PREFIX, serverVerifier, verifySecret } from "./passwords.mjs";
const key = n => n.toString(16).padStart(64, "0");
const clientSalt = "00112233445566778899aabbccddeeff";
const authSecret = "770a3acfe88d84246bb86e64620fd89abb40979e5d437e1e912dabaca90c9a25";
function harness() {
  const DB = createDatabase();
  let n = 0;
  async function call(path, method = "GET", body, token, headers = {}, env = {}) {
    const response = await worker.fetch(new Request("https://example.test/api" + path, { method,
      headers: { "Content-Type": "application/json", "cf-connecting-ip": "fixture-" + n++, ...(token ? { "X-Session-Token": token } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    }), { DB, DEV_MODE: "true", ...env });
    return { status: response.status, data: await response.json() };
  }
  const registration = { name: "QA Person", username: "qa_person", accountKey: key(1), sessionToken: key(2), authSecret, clientSalt, kdfVersion: 1 };
  async function signup() {
    const result = await call("/accounts", "POST", registration);
    assert.equal(result.status, 200, JSON.stringify(result.data));
    return result.data;
  }
  return { DB, call, signup, registration };
}
test("native/client UTF8 vector includes umlauts, emoji and unchanged whitespace", async () => {
  const password = "  Grüße 🔒 Passwort!  ";
  const actual = pbkdf2Sync(Buffer.from(password, "utf8"), Buffer.from(CLIENT_SALT_PREFIX + clientSalt, "utf8"), 600000, 32, "sha256").toString("hex");
  assert.equal(actual, authSecret);
  assert.notEqual(pbkdf2Sync(Buffer.from(password.trim(), "utf8"), Buffer.from(CLIENT_SALT_PREFIX + clientSalt), 600000, 32, "sha256").toString("hex"), actual);
  assert.equal(await serverVerifier(actual, "ffeeddccbbaa99887766554433221100"), "a0a740a3a7712664c886dbb444867956663349c6ce5700848f54420d24d6a088");
});
test("password signup is replay-safe, case-normalized, never stores the pass-equivalent and preserves legacy recovery", async () => {
  const h = harness();
  try {
    const account = await h.signup();
    for (let n = 0; n < 11; n++) assert.equal((await h.call("/accounts", "POST", { ...h.registration, username: " QA_PERSON " })).status, 200);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM accounts").first()).n, 1);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM account_sessions").first()).n, 1);
    const row = await h.DB.prepare("SELECT * FROM accounts").first();
    assert.equal(row.username, "qa_person");
    assert.equal(row.client_iterations, 600000); assert.equal(row.server_iterations, 100000);
    assert.ok(!JSON.stringify(row).includes(authSecret));
    assert.equal((await h.call("/sessions", "POST", { username: "QA_PERSON", authSecret, sessionToken: key(3) })).status, 200);
    assert.equal((await h.call("/sessions", "POST", { accountKey: key(1), sessionToken: key(4) })).data.account.id, account.account.id);
    assert.equal((await h.call("/sessions", "POST", { username: "qa_person", authSecret: row.password_verifier, sessionToken: key(5) })).status, 401);
    assert.equal((await h.call("/accounts", "POST", { ...h.registration, accountKey: key(9), sessionToken: key(10) })).status, 409);
    assert.ok(!JSON.stringify(account).includes(authSecret));
    assert.equal(account.account.hasPassword, true);
  } finally { h.DB.close(); }
});
test("unknown usernames return stable indistinguishable parameter shape and generic login errors", async () => {
  const h = harness();
  try {
    await h.signup();
    const real = await h.call("/auth/parameters?username=QA_PERSON");
    const fake = await h.call("/auth/parameters?username=unknown_person");
    assert.deepEqual(Object.keys(fake.data).sort(), Object.keys(real.data).sort());
    assert.equal(real.data.clientSalt, clientSalt);
    assert.match(fake.data.clientSalt, /^[a-f0-9]{32}$/);
    assert.deepEqual((await h.call("/auth/parameters?username=unknown_person")).data, fake.data);
    assert.equal(fake.data.iterations, 600000);
    const wrong = await h.call("/sessions", "POST", { username: "qa_person", authSecret: key(8), sessionToken: key(6) });
    const missing = await h.call("/sessions", "POST", { username: "unknown_person", authSecret: key(8), sessionToken: key(7) });
    assert.deepEqual(missing, wrong);
    assert.equal((await h.call("/accounts", "POST", { ...h.registration, username: "üser" })).status, 400);
    assert.equal((await h.call("/sessions", "POST", { username: "qa_person", password: "plaintext password", sessionToken: key(6) })).status, 400);
    assert.equal((await h.call("/auth/parameters?username=qa_person", "GET", undefined, undefined, {}, { DEV_MODE: "false", SETUP_KEY: key(100) })).status, 503);
  } finally { h.DB.close(); }
});
test("credential binding keeps the original account and cannot overwrite another username", async () => {
  const h = harness();
  try {
    const legacy = await h.call("/accounts", "POST", { name: "Legacy", accountKey: key(1), sessionToken: key(2) });
    const body = { username: "legacy_person", authSecret, clientSalt, kdfVersion: 1 };
    const bound = await h.call("/account/credentials", "PUT", body, key(2));
    assert.equal(bound.status, 200);
    assert.equal(bound.data.account.id, legacy.data.account.id);
    assert.equal((await h.call("/account/credentials", "PUT", body, key(2))).status, 200);
    assert.equal((await h.call("/account/credentials", "PUT", { ...body, username: "other_person" }, key(2))).status, 409);
    assert.equal((await h.call("/account/credentials", "PUT", body, key(99))).status, 401);
    assert.equal((await h.call("/sessions", "POST", { username: "legacy_person", authSecret, sessionToken: key(3) })).data.account.id, legacy.data.account.id);
  } finally { h.DB.close(); }
});
test("password changes invalidate every old device and safely replay after lost response", async () => {
  const h = harness();
  try {
    await h.signup();
    await h.call("/sessions", "POST", { username: "qa_person", authSecret, sessionToken: key(3) });
    const change = { currentAuthSecret: authSecret, newAuthSecret: key(90), clientSalt: "ffeeddccbbaa99887766554433221100", kdfVersion: 1, sessionToken: key(4) };
    const changed = await h.call("/account/password", "PUT", change, key(2));
    assert.equal(changed.status, 200, JSON.stringify(changed.data));
    for (const token of [key(2),key(3)]) assert.equal((await h.call("/account", "GET", undefined, token)).status, 401);
    const replay = await h.call("/account/password", "PUT", { ...change, currentAuthSecret: "" }, key(2));
    assert.equal(replay.status, 200); assert.equal(replay.data.sessionToken, key(4));
    assert.equal((await h.call("/sessions", "POST", { username: "qa_person", authSecret, sessionToken: key(5) })).status, 401);
    assert.equal((await h.call("/sessions", "POST", { username: "qa_person", authSecret: key(90), sessionToken: key(5) })).status, 200);
    assert.equal((await h.call("/account", "DELETE", { authSecret }, key(4))).status, 401);
    assert.equal((await h.call("/account", "DELETE", { authSecret: key(90) }, key(4))).status, 200);
    assert.equal((await h.call("/account", "GET", undefined, key(5))).status, 401);
  } finally { h.DB.close(); }
});
test("a login verified just before a password rotation cannot issue a surviving session", async () => {
  const h = harness();
  try {
    await h.signup();
    const prepare = h.DB.prepare.bind(h.DB);
    let rotated = false;
    h.DB.prepare = sql => {
      const statement = prepare(sql);
      if (!rotated && sql.startsWith("INSERT OR IGNORE INTO account_sessions")) {
        const run = statement.run.bind(statement);
        statement.run = async () => {
          rotated = true;
          await prepare("UPDATE accounts SET auth_version = auth_version + 1").run();
          return run();
        };
      }
      return statement;
    };
    assert.equal((await h.call("/sessions", "POST", { username: "qa_person", authSecret, sessionToken: key(3) })).status, 409);
    assert.equal((await h.call("/account", "GET", undefined, key(3))).status, 401);
  } finally { h.DB.close(); }
});

test("an overtaken password change cannot issue a session for the later credential version", async () => {
  const h = harness();
  try {
    await h.signup();
    const prepare = h.DB.prepare.bind(h.DB);
    let overtaken = false;
    h.DB.prepare = sql => {
      const statement = prepare(sql);
      if (!overtaken && sql.startsWith("UPDATE OR IGNORE accounts SET client_salt")) {
        const run = statement.run.bind(statement);
        statement.run = async () => {
          const result = await run();
          overtaken = true;
          // Another authenticated change has committed before this operation's readback.
          await prepare("UPDATE accounts SET auth_version = auth_version + 1, password_change_token_hash = ?").bind(key(99)).run();
          return result;
        };
      }
      return statement;
    };
    const changed = await h.call("/account/password", "PUT", {
      currentAuthSecret: authSecret, newAuthSecret: key(90), clientSalt: "ffeeddccbbaa99887766554433221100", kdfVersion: 1, sessionToken: key(4)
    }, key(2));
    assert.equal(changed.status, 409);
    assert.equal((await h.call("/account", "GET", undefined, key(4))).status, 401);
  } finally { h.DB.close(); }
});
test("guest claim transfer uses possession proof, preserves other guests, and is replay-safe", async () => {
  const h = harness();
  try {
    const list = (await h.call("/lists", "POST", { title: "Gast", ownerKey: key(10) })).data;
    const path = "/lists/" + list.id;
    const added = await h.call(path + "/items", "POST", { title: "Buch" }, undefined, { Authorization: "Bearer " + key(10) });
    const item = added.data.items[0].id;
    await h.call(path + "/items/" + item + "/reservation", "POST", { action: "reserve" }, undefined, { "X-Claim-Key": key(20) });
    await h.signup();
    assert.equal((await h.call("/account/claims/attach", "POST", { claimKey: key(21) }, key(2))).data.reservations, 0);
    assert.equal((await h.call("/account/claims/attach", "POST", { claimKey: key(20) }, key(2))).data.reservations, 1);
    assert.equal((await h.call("/account/claims/attach", "POST", { claimKey: key(20) }, key(2))).data.reservations, 0);
    assert.equal((await h.call(path, "GET", undefined, key(2))).data.items[0].mine, true);
    assert.equal((await h.call(path, "GET", undefined, undefined, { "X-Claim-Key": key(20) })).data.items[0].mine, false);
    assert.equal((await h.call("/account/gifts", "GET", undefined, key(2))).data.lists[0].items[0].id, item);
  } finally { h.DB.close(); }
});
test("username verification budgets are fixed and cannot be bypassed by changing source IP", async () => {
  const h = harness();
  try {
    await h.signup();
    for (let n = 0; n < 19; n++) assert.equal((await h.call("/sessions", "POST", { username: "qa_person", authSecret: key(90), sessionToken: key(100+n) })).status, 401);
    assert.equal((await h.call("/sessions", "POST", { username: "QA_PERSON", authSecret, sessionToken: key(200) })).status, 429);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM credential_buckets").first()).n, 1);
    await assert.rejects(h.DB.prepare("INSERT INTO credential_buckets (bucket,window,attempts) VALUES (256,0,1)").run());
  } finally { h.DB.close(); }
});

test("guest claim transfer rejects an over-cap merge without partially moving reservations", async () => {
  const h = harness();
  try {
    const account = await h.signup();
    const mine = createHash("sha256").update("account:" + account.account.id).digest("hex");
    const guest = createHash("sha256").update(key(20)).digest("hex");
    const list = (await h.call("/lists", "POST", { title: "Geschenke", ownerKey: key(10) })).data;
    const second = (await h.call("/lists", "POST", { title: "Geschenke zwei", ownerKey: key(11) })).data;
    for (let n = 0; n < 51; n++) {
      await h.DB.prepare("INSERT INTO items (id,list_id,title,claim_hash,created_at) VALUES (?,?,?,?,?)")
        .bind(n.toString(16).padStart(24,"0"), n < 26 ? list.id : second.id, "Fixture", n < 49 ? mine : guest, n).run();
    }
    assert.equal((await h.call("/account/claims/attach", "POST", { claimKey: key(20) }, key(2))).status, 409);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM items WHERE claim_hash = ?").bind(guest).first()).n, 2);
    await h.DB.prepare("DELETE FROM items WHERE id = ?").bind("0".repeat(24)).run();
    assert.equal((await h.call("/account/claims/attach", "POST", { claimKey: key(20) }, key(2))).data.reservations, 2);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM items WHERE claim_hash = ?").bind(mine).first()).n, 50);
  } finally { h.DB.close(); }
});
