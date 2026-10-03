import test from "node:test";
import assert from "node:assert/strict";
import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
import worker from "./worker.mjs";
import { createDatabase } from "./sqlite-adapter.mjs";
import { ensureInviteCode, normalizeInviteCode } from "./list-metadata.mjs";
import { invitationBackfill } from "./backfill-invites.mjs";

const key = n => n.toString(16).padStart(64, "0");
function harness() {
  const DB = createDatabase();
  let sequence = 0;
  async function call(path, method = "GET", body, credentials = {}, extra = {}) {
    const headers = { "Content-Type": "application/json", "cf-connecting-ip": "fixture-" + sequence++, ...extra };
    if (credentials.owner) headers.Authorization = "Bearer " + credentials.owner;
    if (credentials.token) headers["X-Session-Token"] = credentials.token;
    const response = await worker.fetch(new Request("https://example.test/api" + path, { method, headers, body: body === undefined ? undefined : JSON.stringify(body) }), { DB, DEV_MODE: "true" });
    return { status: response.status, data: await response.json() };
  }
  return { DB, call };
}

test("all40 covers persist, omitted PATCH fields survive, unknown covers are rejected", async () => {
  const h = harness(), owner = key(1);
  try {
    const created = await h.call("/lists", "POST", { title: "Geburtstag", date: "2026-12-12", description: "Zusammen feiern", ownerKey: owner });
    assert.equal(created.status, 200);
    assert.equal(created.data.coverId, "cover_01");
    const path = "/lists/" + created.data.id;
    for (let n = 1; n <= 40; n++) {
      const coverId = "cover_" + String(n).padStart(2, "0");
      const updated = await h.call(path, "PATCH", { coverId }, { owner });
      assert.equal(updated.status, 200);
      assert.equal(updated.data.coverId, coverId);
      assert.equal(updated.data.title, "Geburtstag");
      assert.equal(updated.data.date, "2026-12-12");
      assert.equal(updated.data.description, "Zusammen feiern");
      assert.equal((await h.call(path)).data.coverId, coverId);
    }
    const olderClient = await h.call(path, "PATCH", { title: "Neuer Titel", date: "2026-12-13" }, { owner });
    assert.equal(olderClient.data.coverId, "cover_40");
    for (const coverId of [null, "", 1, "cover_00", "cover_41", "cover_1", "cover_01 ", "https://attacker.test/cover.svg"]) {
      assert.equal((await h.call(path, "PATCH", { coverId }, { owner })).status, 400);
      assert.equal((await h.call("/lists", "POST", { title: "Invalid", ownerKey: key(100), coverId })).status, 400);
    }
    assert.equal((await h.call(path, "PATCH", { coverId: "cover_01" })).status, 403);
    await assert.rejects(h.DB.prepare("UPDATE lists SET cover_id = 'cover_41' WHERE id = ?").bind(created.data.id).run());
  } finally { h.DB.close(); }
});

test("codes are unique and stable on creation replay and never confer ownership", async () => {
  const h = harness();
  try {
    const first = await h.call("/lists", "POST", { title: "A", ownerKey: key(1), coverId: "cover_23" });
    const second = await h.call("/lists", "POST", { title: "B", ownerKey: key(2) });
    assert.match(first.data.inviteCode, /^[a-f0-9]{10}$/);
    assert.notEqual(first.data.inviteCode, second.data.inviteCode);
    const replay = await h.call("/lists", "POST", { title: "A", ownerKey: key(1), coverId: "cover_02" });
    assert.equal(replay.data.inviteCode, first.data.inviteCode);
    assert.equal(replay.data.coverId, "cover_23");
    const path = "/lists/" + first.data.id;
    assert.ok(!("inviteCode" in (await h.call(path)).data));
    assert.ok(!("inviteCode" in (await h.call(path + "?guest=1", "GET", undefined, { owner: key(1) })).data));
    assert.equal((await h.call(path, "PATCH", { title: "No" }, { owner: first.data.inviteCode })).status, 403);
    await assert.rejects(h.DB.prepare("UPDATE lists SET invite_code = ? WHERE id = ?").bind(first.data.inviteCode, second.data.id).run());
  } finally { h.DB.close(); }
});

test("a cover-only PATCH preserves a title concurrently saved after the initial read", async () => {
  const h = harness();
  try {
    const created = (await h.call("/lists", "POST", { title: "Before", ownerKey: key(1) })).data;
    const prepare = h.DB.prepare.bind(h.DB);
    h.DB.prepare = sql => {
      const statement = prepare(sql);
      if (sql.startsWith("UPDATE lists SET") && sql.includes("cover_id")) {
        const run = statement.run.bind(statement);
        statement.run = async () => {
          await prepare("UPDATE lists SET title = 'Concurrent title', event_date = '2026-12-24' WHERE id = ?").bind(created.id).run();
          return run();
        };
      }
      return statement;
    };
    const updated = await h.call("/lists/" + created.id, "PATCH", { coverId: "cover_40" }, { owner: key(1) });
    assert.equal(updated.status, 200);
    assert.equal(updated.data.title, "Concurrent title");
    assert.equal(updated.data.date, "2026-12-24");
    assert.equal(updated.data.coverId, "cover_40");
  } finally { h.DB.close(); }
});

test("public lookup accepts formatted codes and returns only a preview without autojoining", async () => {
  const h = harness();
  try {
    const auth = await h.call("/accounts", "POST", { name: "Private owner", accountKey: key(1), sessionToken: key(2) });
    const created = await h.call("/lists", "POST", { title: "Gemeinsam", date: "2026-12-12", description: "Nur Vorschau", ownerKey: key(3), coverId: "cover_12" }, { token: auth.data.sessionToken });
    const path = "/lists/" + created.data.id;
    await h.call(path + "/items", "POST", { title: "Private preview detail", priceCents: 1234 }, { token: auth.data.sessionToken });
    const formatted = created.data.inviteCode.slice(0, 5).toUpperCase() + " - " + created.data.inviteCode.slice(5).toUpperCase();
    const preview = await h.call("/invites/" + encodeURIComponent(formatted), "GET", undefined, { token: "expired-or-malformed-is-irrelevant" });
    assert.equal(preview.status, 200);
    assert.deepEqual(preview.data, { id: created.data.id, title: "Gemeinsam", date: "2026-12-12", description: "Nur Vorschau", coverId: "cover_12", coverImageUrl: "", itemCount: 1 });
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM account_joins").first()).n, 0);
    assert.equal((await h.call("/account/lists", "GET", undefined, { token: auth.data.sessionToken })).data.lists[0].inviteCode, created.data.inviteCode);
    assert.equal((await h.call("/account/join", "POST", { listId: created.data.id }, { token: auth.data.sessionToken })).status, 200);
    const gifts = (await h.call("/account/gifts", "GET", undefined, { token: auth.data.sessionToken })).data.lists[0];
    assert.equal(gifts.coverId, "cover_12");
    assert.ok(!("inviteCode" in gifts));
    assert.equal((await h.call("/invites/zzzzz-zzzzz")).status, 400);
    assert.equal((await h.call("/invites/0000000000")).status, 404);
    assert.equal((await h.call("/invites/" + created.data.inviteCode, "POST", {})).status, 405);
  } finally { h.DB.close(); }
});

test("lookup attempts are bounded separately from auth, including invalid and missing codes", async () => {
  const h = harness(), headers = { "cf-connecting-ip": "same-lookup-client" };
  try {
    for (let n = 0; n < 30; n++) assert.equal((await h.call("/invites/no", "GET", undefined, {}, headers)).status, 400);
    assert.equal((await h.call("/invites/0000000000", "GET", undefined, {}, headers)).status, 429);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM invite_buckets").first()).n, 1);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM auth_buckets").first()).n, 0);
    assert.equal((await h.call("/accounts", "POST", { name: "Still works", accountKey: key(1), sessionToken: key(2) }, {}, headers)).status, 200);
    await h.DB.prepare("UPDATE invite_buckets SET window = -1").run();
    assert.equal((await h.call("/invites/no", "GET", undefined, {}, headers)).status, 400);
    assert.equal((await h.DB.prepare("SELECT attempts FROM invite_buckets").first()).attempts, 1);
    await assert.rejects(h.DB.prepare("INSERT INTO invite_buckets (bucket, window, attempts) VALUES (256, 0, 1)").run());
  } finally { h.DB.close(); }
});

test("legacy code assignment recovers collisions and simultaneous owner reads converge", async () => {
  const h = harness();
  try {
    const a = (await h.call("/lists", "POST", { title: "A", ownerKey: key(1) })).data;
    const b = (await h.call("/lists", "POST", { title: "B", ownerKey: key(2) })).data;
    await h.DB.prepare("UPDATE lists SET invite_code = NULL WHERE id = ?").bind(b.id).run();
    const row = await h.DB.prepare("SELECT * FROM lists WHERE id = ?").bind(b.id).first();
    let attempt = 0;
    assert.equal(await ensureInviteCode(h.DB, row, () => attempt++ === 0 ? a.inviteCode : "1234567890", () => assert.fail("Allocation failed")), "1234567890");
    await h.DB.prepare("UPDATE lists SET invite_code = NULL WHERE id = ?").bind(b.id).run();
    const replies = await Promise.all([1,2].map(() => h.call("/lists/" + b.id, "GET", undefined, { owner: key(2) })));
    assert.equal(replies[0].data.inviteCode, replies[1].data.inviteCode);
    assert.match(replies[0].data.inviteCode, /^[a-f0-9]{10}$/);
  } finally { h.DB.close(); }
});

test("migration and CSPRNG backfill preserve legacy list metadata, keys, items and claims", () => {
  const db = new DatabaseSync(":memory:");
  try {
    db.exec(readFileSync(new URL("schema.sql", import.meta.url), "utf8"));
    for (const migration of ["0001_list_description.sql", "0002_multiple_lists.sql", "0003_product_preview_budget.sql", "0004_accounts.sql"]) db.exec(readFileSync(new URL("migrations/" + migration, import.meta.url), "utf8"));
    db.prepare("INSERT INTO lists (id,title,event_date,owner_hash,created_at,description,creator_hash) VALUES (?, 'Legacy', '2026-12-12', 'owner-proof', 1, 'Keep me', 'creator-proof')").run("a".repeat(24));
    db.prepare("INSERT INTO items (id,list_id,title,claim_hash,created_at) VALUES (?, ?, 'Present', 'claim-proof', 1)").run("b".repeat(24), "a".repeat(24));
    const before = db.prepare("SELECT * FROM lists").get();
    db.exec(readFileSync(new URL("migrations/0005_covers_invitation_codes.sql", import.meta.url), "utf8"));
    const after = db.prepare("SELECT * FROM lists").get();
    assert.deepEqual({ ...after, cover_id: undefined, invite_code: undefined }, { ...before, cover_id: undefined, invite_code: undefined });
    assert.equal(after.cover_id, "cover_01");
    const sql = invitationBackfill([{ results: db.prepare("SELECT id,invite_code FROM lists").all() }]);
    db.exec(sql);
    const code = db.prepare("SELECT invite_code FROM lists").get().invite_code;
    assert.match(code, /^[a-f0-9]{10}$/);
    db.exec(sql);
    assert.equal(db.prepare("SELECT invite_code FROM lists").get().invite_code, code);
    assert.equal(db.prepare("SELECT claim_hash FROM items").get().claim_hash, "claim-proof");
    assert.equal(db.prepare("PRAGMA foreign_key_check").all().length, 0);
    assert.throws(() => invitationBackfill([{ id: "'; DROP TABLE lists;--", invite_code: null }]));
    assert.equal(normalizeInviteCode("ABCD-EF 1234"), "abcdef1234");
    assert.equal(normalizeInviteCode("abcdef123456"), "");
  } finally { db.close(); }
});
