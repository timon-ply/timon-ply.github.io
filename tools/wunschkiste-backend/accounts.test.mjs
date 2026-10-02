import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";
import { createDatabase } from "./sqlite-adapter.mjs";

const key = n => n.toString(16).padStart(64, "0");
function harness() {
  const DB = createDatabase();
  let sequence = 0;
  async function call(path, method = "GET", body, token, headers = {}) {
    if (method === "POST" && ["/accounts", "/sessions", "/account/rotate-key"].includes(path) && body && !body.sessionToken) body = { ...body, sessionToken: key(100000 + sequence) };
    const response = await worker.fetch(new Request("https://example.test/api" + path, {
      method, headers: { "Content-Type": "application/json", "cf-connecting-ip": "fixture-" + sequence++, ...(token ? { "X-Session-Token": token } : {}), ...headers },
      body: body === undefined ? undefined : JSON.stringify(body)
    }), { DB, DEV_MODE: "true" });
    return { status: response.status, data: await response.json() };
  }
  async function signup(n, name = "Person " + n) {
    const response = await call("/accounts", "POST", { name, accountKey: key(n), deviceName: "Telefon" });
    assert.equal(response.status, 200, JSON.stringify(response.data));
    return response.data;
  }
  async function list(session, n) {
    const response = await call("/lists", "POST", { title: "Geburtstag", ownerKey: key(n) }, session);
    assert.equal(response.status, 200, JSON.stringify(response.data));
    return response.data;
  }
  return { DB, call, signup, list };
}

test("signup replay keeps account identity; device login recovers own lists without exposing keys", async () => {
  const h = harness();
  try {
    const first = await h.signup(1);
    const list = await h.list(first.sessionToken, 11);
    const replay = await h.signup(1, "Changed replay name");
    assert.equal(replay.account.id, first.account.id);
    assert.equal(replay.account.name, first.account.name);
    assert.notEqual(replay.sessionToken, first.sessionToken);
    const login = await h.call("/sessions", "POST", { accountKey: key(1), deviceName: "Tablet" });
    assert.equal(login.status, 200);
    const lists = await h.call("/account/lists", "GET", undefined, login.data.sessionToken);
    assert.equal(lists.data.lists[0].id, list.id);
    assert.ok(!JSON.stringify(lists).includes(key(11)));
    assert.equal((await h.call("/account", "GET", undefined, key(1))).status, 401);
    const row = await h.DB.prepare("SELECT * FROM accounts").first();
    assert.notEqual(row.key_hash, key(1));
    assert.notEqual((await h.DB.prepare("SELECT token_hash FROM account_sessions LIMIT 1").first()).token_hash, first.sessionToken);
  } finally { h.DB.close(); }
});

test("account ownership and invitation guest mode preserve independent authorization", async () => {
  const h = harness();
  try {
    const a = await h.signup(1), b = await h.signup(2), list = await h.list(a.sessionToken, 11);
    const path = "/lists/" + list.id;
    assert.equal((await h.call(path, "GET", undefined, a.sessionToken)).data.isOwner, true);
    assert.equal((await h.call(path + "?guest=1", "GET", undefined, a.sessionToken)).data.isOwner, false);
    assert.equal((await h.call(path, "PATCH", { title: "Hijack" }, b.sessionToken)).status, 403);
    assert.equal((await h.call(path + "/product-preview", "POST", { url: "https://www.lidl.de/p/a/p1" }, b.sessionToken)).status, 403);
    assert.equal((await h.call(path, "PATCH", { title: "Bearbeitet" }, a.sessionToken)).status, 200);
    assert.equal((await h.call(path, "PATCH", { title: "Legacy" }, undefined, { Authorization: "Bearer " + key(11) })).status, 403);
    assert.equal((await h.call("/lists", "POST", { title: "Replay", ownerKey: key(11) }, b.sessionToken)).status, 403);
    assert.equal((await h.call("/lists", "POST", { title: "Replay", ownerKey: key(11) }, a.sessionToken)).data.id, list.id);
    const legacy = await h.list(undefined, 12);
    assert.equal((await h.call("/account/lists/attach", "POST", { listId: legacy.id, ownerKey: key(13) }, a.sessionToken)).status, 403);
    assert.equal((await h.call("/account/lists/attach", "POST", { listId: legacy.id, ownerKey: key(12) }, a.sessionToken)).status, 200);
    assert.equal((await h.call("/lists/" + legacy.id, "PATCH", { title: "Legacy remains" }, undefined, { Authorization: "Bearer " + key(12) })).status, 200);
    assert.equal((await h.call("/account/lists/attach", "POST", { listId: legacy.id, ownerKey: key(12) }, b.sessionToken)).status, 403);
  } finally { h.DB.close(); }
});

test("account reservations sync between devices while anonymous guests stay independent", async () => {
  const h = harness();
  try {
    const a = await h.signup(1), b = await h.signup(2), list = await h.list(a.sessionToken, 11), path = "/lists/" + list.id;
    const added = await h.call(path + "/items", "POST", { title: "Buch" }, a.sessionToken);
    const reserve = path + "/items/" + added.data.items[0].id + "/reservation";
    assert.equal((await h.call(reserve, "POST", { action: "reserve" }, b.sessionToken)).status, 200);
    const device = await h.call("/sessions", "POST", { accountKey: key(2) });
    assert.equal((await h.call(path, "GET", undefined, device.data.sessionToken)).data.items[0].mine, true);
    assert.equal((await h.call(path, "GET", undefined, undefined, { "X-Claim-Key": key(30) })).data.items[0].mine, false);
    assert.equal((await h.call(reserve, "POST", { action: "release" }, undefined, { "X-Claim-Key": key(30) })).status, 409);
    assert.equal((await h.call(reserve, "POST", { action: "buy" }, device.data.sessionToken)).status, 200);
    const gifts = await h.call("/account/gifts", "GET", undefined, b.sessionToken);
    assert.equal(gifts.data.lists[0].items[0].status, "purchased");
    const empty = await h.list(a.sessionToken, 12);
    assert.equal((await h.call("/account/join", "POST", { listId: empty.id }, b.sessionToken)).status, 200);
    assert.equal((await h.call("/account/gifts", "GET", undefined, b.sessionToken)).data.lists.length, 2);
  } finally { h.DB.close(); }
});

test("rotation invalidates every previous session, rejects old key, and permits lost-response replay", async () => {
  const h = harness();
  try {
    const a = await h.signup(1), device = await h.call("/sessions", "POST", { accountKey: key(1) });
    const rotation = await h.call("/account/rotate-key", "POST", { currentKey: key(1), newKey: key(3) }, a.sessionToken);
    assert.equal(rotation.status, 200);
    for (const token of [a.sessionToken, device.data.sessionToken]) assert.equal((await h.call("/account", "GET", undefined, token)).status, 401);
    assert.equal((await h.call("/sessions", "POST", { accountKey: key(1) })).status, 401);
    const replay = await h.call("/account/rotate-key", "POST", { currentKey: key(1), newKey: key(3) }, a.sessionToken);
    assert.equal(replay.status, 200);
    assert.equal(replay.data.account.id, a.account.id);
    assert.equal((await h.call("/account", "GET", undefined, replay.data.sessionToken)).status, 200);
    assert.equal((await h.call("/account/rotate-key", "POST", { currentKey: key(1), newKey: key(4) })).status, 401);
  } finally { h.DB.close(); }
});

test("concurrent rotations cannot both change the secret, and concurrent old-key login cannot survive", async () => {
  const h = harness();
  try {
    const a = await h.signup(1);
    const responses = await Promise.all([
      h.call("/account/rotate-key", "POST", { currentKey: key(1), newKey: key(3) }, a.sessionToken),
      h.call("/account/rotate-key", "POST", { currentKey: key(1), newKey: key(4) }, a.sessionToken),
      h.call("/sessions", "POST", { accountKey: key(1) })
    ]);
    assert.equal(responses.slice(0, 2).filter(r => r.status === 200).length, 1);
    if (responses[2].status === 200) assert.equal((await h.call("/account", "GET", undefined, responses[2].data.sessionToken)).status, 401);
    assert.equal((await h.call("/account", "GET", undefined, a.sessionToken)).status, 401);
  } finally { h.DB.close(); }
});

test("session revocation is scoped, expiration enforced, and logout revokes current device", async () => {
  const h = harness();
  try {
    const a = await h.signup(1), b = await h.signup(2);
    const aSessions = await h.call("/account/sessions", "GET", undefined, a.sessionToken);
    const sid = aSessions.data.sessions[0].id;
    assert.equal(aSessions.data.sessions[0].current, true);
    await h.call("/account/sessions/" + sid, "DELETE", undefined, b.sessionToken);
    assert.equal((await h.call("/account", "GET", undefined, a.sessionToken)).status, 200);
    await h.call("/account/logout", "POST", {}, a.sessionToken);
    assert.equal((await h.call("/account", "GET", undefined, a.sessionToken)).status, 401);
    await h.DB.prepare("UPDATE account_sessions SET expires_at = 0").run();
    assert.equal((await h.call("/account", "GET", undefined, b.sessionToken)).status, 401);
  } finally { h.DB.close(); }
});

test("account deletion requires recovery proof and atomically removes owned data, preserving others", async () => {
  const h = harness();
  try {
    const a = await h.signup(1), b = await h.signup(2), own = await h.list(a.sessionToken, 11), other = await h.list(b.sessionToken, 12);
    await h.call("/lists/" + own.id + "/items", "POST", { title: "Eigen" }, a.sessionToken);
    const added = await h.call("/lists/" + other.id + "/items", "POST", { title: "Fremd" }, b.sessionToken);
    await h.call("/lists/" + other.id + "/items/" + added.data.items[0].id + "/reservation", "POST", { action: "reserve" }, a.sessionToken);
    await h.call("/account/join", "POST", { listId: own.id }, b.sessionToken);
    assert.equal((await h.call("/account", "PATCH", { name: "Neuer Name" }, a.sessionToken)).data.account.name, "Neuer Name");
    assert.equal((await h.call("/account", "DELETE", { currentKey: key(2) }, a.sessionToken)).status, 401);
    assert.equal((await h.call("/account", "DELETE", { currentKey: key(1) }, a.sessionToken)).status, 200);
    assert.equal((await h.call("/lists/" + own.id)).status, 404);
    assert.equal((await h.call("/account", "GET", undefined, a.sessionToken)).status, 401);
    assert.equal((await h.call("/lists/" + other.id)).data.items[0].status, "open");
    assert.equal((await h.call("/account/gifts", "GET", undefined, b.sessionToken)).data.lists.length, 0);
  } finally { h.DB.close(); }
});

test("session and authentication budgets are bounded and reject instead of growing storage", async () => {
  const h = harness();
  try {
    await h.signup(1);
    for (let i = 0; i < 9; i++) assert.equal((await h.call("/sessions", "POST", { accountKey: key(1) })).status, 200);
    assert.equal((await h.call("/sessions", "POST", { accountKey: key(1) })).status, 409);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM account_sessions").first()).n, 10);
    const headers = { "cf-connecting-ip": "fixed-budget-fixture" };
    for (let i = 0; i < 30; i++) await h.call("/sessions", "POST", { accountKey: key(999) }, undefined, headers);
    assert.equal((await h.call("/sessions", "POST", { accountKey: key(999) }, undefined, headers)).status, 429);
    assert.ok((await h.DB.prepare("SELECT COUNT(*) AS n FROM auth_buckets").first()).n <= 256);
  } finally { h.DB.close(); }
});

test("more than ten lost-response retries reuse one session for signup, login and rotation", async () => {
  const h = harness();
  try {
    const signup = { name: "Replay", accountKey: key(1), sessionToken: key(1001) };
    for (let i = 0; i < 12; i++) assert.equal((await h.call("/accounts", "POST", signup)).status, 200);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM account_sessions").first()).n, 1);
    const login = { accountKey: key(1), sessionToken: key(1002) };
    for (let i = 0; i < 12; i++) assert.equal((await h.call("/sessions", "POST", login)).data.sessionToken, key(1002));
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM account_sessions").first()).n, 2);
    const rotation = { currentKey: key(1), newKey: key(3), sessionToken: key(1003) };
    for (let i = 0; i < 12; i++) assert.equal((await h.call("/account/rotate-key", "POST", rotation, key(1001))).data.sessionToken, key(1003));
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM account_sessions").first()).n, 1);
    assert.equal((await h.call("/account", "GET", undefined, key(1003))).status, 200);
  } finally { h.DB.close(); }
});

test("revoked sessions cannot fall back to the account list creation key", async () => {
  const h = harness();
  try {
    const a = await h.signup(1), list = await h.list(a.sessionToken, 11);
    await h.call("/account/logout", "POST", {}, a.sessionToken);
    assert.equal((await h.call("/lists/" + list.id, "PATCH", { title: "Hijack" }, undefined, { Authorization: "Bearer " + key(11) })).status, 403);
    assert.equal((await h.call("/lists", "POST", { title: "Replay", ownerKey: key(11) })).status, 403);
  } finally { h.DB.close(); }
});

test("account reservation budget is atomic across two competing wishes", async () => {
  const h = harness();
  try {
    const a = await h.signup(1), b = await h.signup(2), list = await h.list(a.sessionToken, 11);
    const claim = (await h.DB.prepare("SELECT claim_hash FROM accounts WHERE id = ?").bind(b.account.id).first()).claim_hash;
    for (let i = 0; i < 49; i++) await h.DB.prepare("INSERT INTO items (id, list_id, title, claim_hash, created_at) VALUES (?, ?, ?, ?, 0)").bind(i.toString(16).padStart(24, "0"), list.id, "Reserved", claim).run();
    for (let i = 49; i < 51; i++) await h.DB.prepare("INSERT INTO items (id, list_id, title, created_at) VALUES (?, ?, ?, 0)").bind(i.toString(16).padStart(24, "0"), list.id, "Open").run();
    const replies = await Promise.all([49,50].map(i => h.call("/lists/" + list.id + "/items/" + i.toString(16).padStart(24, "0") + "/reservation", "POST", { action: "reserve" }, b.sessionToken)));
    assert.deepEqual(replies.map(r => r.status).sort(), [200,409]);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM items WHERE claim_hash = ?").bind(claim).first()).n, 50);
    assert.equal((await h.call("/account/gifts", "GET", undefined, b.sessionToken)).data.lists[0].items.length, 50);
  } finally { h.DB.close(); }
});

test("account, owned-list and saved-invitation limits fail closed", async () => {
  const h = harness();
  try {
    const a = await h.signup(1);
    for (let i = 0; i < 20; i++) await h.list(a.sessionToken, 100 + i);
    assert.equal((await h.call("/lists", "POST", { title: "Too many", ownerKey: key(999) }, a.sessionToken)).status, 429);
    const legacy = await h.list(undefined, 200);
    assert.equal((await h.call("/account/lists/attach", "POST", { listId: legacy.id, ownerKey: key(200) }, a.sessionToken)).status, 403);
    for (let i = 0; i < 50; i++) {
      const list = await h.list(undefined, 300 + i);
      assert.equal((await h.call("/account/join", "POST", { listId: list.id }, a.sessionToken)).status, 200);
    }
    assert.equal((await h.call("/account/join", "POST", { listId: legacy.id }, a.sessionToken)).status, 409);
    await h.DB.prepare("WITH RECURSIVE n(x) AS (SELECT 1 UNION ALL SELECT x + 1 FROM n WHERE x < 499) INSERT INTO accounts (id, name, key_hash, claim_hash, created_at) SELECT printf('%024x', x), 'Fixture', printf('%064x', x), 'claim-' || x, 0 FROM n").run();
    assert.equal((await h.call("/accounts", "POST", { name: "Full", accountKey: key(12345) })).status, 429);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM accounts").first()).n, 500);
    assert.equal((await h.call("/accounts", "POST", { name: "Replay", accountKey: key(1), sessionToken: a.sessionToken })).status, 200);
  } finally { h.DB.close(); }
});
