import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";
import { createDatabase } from "./sqlite-adapter.mjs";
import { sanitizeJpeg } from "./custom-covers.mjs";
// Actual 8x8 JPEG emitted by the platform JPEG encoder; no personal content.
const IMAGE = new Uint8Array(Buffer.from('/9j/4AAQSkZJRgABAQEAYABgAAD/2wBDAAMCAgMCAgMDAwMEAwMEBQgFBQQEBQoHBwYIDAoMDAsKCwsNDhIQDQ4RDgsLEBYQERMUFRUVDA8XGBYUGBIUFRT/2wBDAQMEBAUEBQkFBQkUDQsNFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBQUFBT/wAARCAAIAAgDASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD8qqKKKAP/2Q==', 'base64'));
const key = n => n.toString(16).padStart(64, "0");
function harness() {
  const DB = createDatabase();
  async function call(path, method = "GET", body, credentials = {}, extra = {}) {
    const binary = body instanceof Uint8Array;
    const headers = { "Content-Type": binary ? "image/jpeg" : "application/json", ...extra };
    if (credentials.owner) headers.Authorization = "Bearer " + credentials.owner;
    if (credentials.token) headers["X-Session-Token"] = credentials.token;
    const response = await worker.fetch(new Request("https://example.test/api" + path, { method, headers, body: body === undefined ? undefined : binary ? body : JSON.stringify(body) }), { DB, DEV_MODE: "true" });
    const bytes = new Uint8Array(await response.arrayBuffer());
    return { status: response.status, headers: response.headers, bytes, data: response.headers.get("content-type")?.includes("json") ? JSON.parse(new TextDecoder().decode(bytes)) : null };
  }
  return { DB, call };
}
test("JPEG validation strips metadata and rejects corrupt, oversized-dimension and appended data", () => {
  const metadata = new Uint8Array([255,225,0,10,69,120,105,102,71,80,83,0]);
  const withMetadata = new Uint8Array([...IMAGE.subarray(0,2),...metadata,...IMAGE.subarray(2)]);
  const sanitized = sanitizeJpeg(withMetadata);
  assert.equal(sanitized.width, 8); assert.equal(sanitized.height, 8);
  assert.ok(!Buffer.from(sanitized.bytes).includes(Buffer.from("ExifGPS")));
  assert.deepEqual(sanitizeJpeg(sanitized.bytes).bytes, sanitized.bytes);
  assert.throws(() => sanitizeJpeg(IMAGE.subarray(0, 200)));
  assert.throws(() => sanitizeJpeg(new Uint8Array([...IMAGE,60,115,99,114,105,112,116,62])));
  const largeDimensions = IMAGE.slice();
  const sof = Buffer.from(largeDimensions).indexOf(Buffer.from([255,192]));
  largeDimensions[sof + 5] = 255; largeDimensions[sof + 6] = 255;
  assert.throws(() => sanitizeJpeg(largeDimensions));
});
test("owners upload bounded BLOBs; public reads and metadata edits preserve correct image state", async () => {
  const h = harness();
  try {
    const list = (await h.call("/lists", "POST", { title: "Bild", ownerKey: key(1) })).data, path = "/lists/" + list.id;
    assert.equal((await h.call(path + "/cover", "PUT", IMAGE)).status, 403);
    assert.equal((await h.call(path + "/cover", "PUT", IMAGE, { owner: key(2) })).status, 403);
    const uploaded = await h.call(path + "/cover", "PUT", IMAGE, { owner: key(1) });
    assert.equal(uploaded.status, 200, JSON.stringify(uploaded.data));
    assert.match(uploaded.data.coverImageUrl, new RegExp(list.id + "/cover\\?v=[a-f0-9]{64}$"));
    const row = await h.DB.prepare("SELECT typeof(jpeg) AS type, length(jpeg) AS size FROM list_covers").first();
    assert.equal(row.type, "blob"); assert.ok(row.size < IMAGE.length);
    const fetched = await h.call(path + "/cover");
    assert.equal(fetched.headers.get("content-type"), "image/jpeg");
    assert.equal(fetched.headers.get("x-content-type-options"), "nosniff");
    assert.deepEqual(fetched.bytes, sanitizeJpeg(IMAGE).bytes);
    assert.equal((await h.call(path + "/cover", "GET", undefined, {}, { "If-None-Match": fetched.headers.get("etag") })).status, 304);
    assert.equal((await h.call(path, "PATCH", { title: "Bearbeitet" }, { owner: key(1) })).data.coverImageUrl, uploaded.data.coverImageUrl);
    assert.equal((await h.call("/invites/" + list.inviteCode)).data.coverImageUrl, uploaded.data.coverImageUrl);
    assert.equal((await h.call(path + "/cover", "PUT", IMAGE, { owner: key(1) })).status, 200);
    assert.equal((await h.DB.prepare("SELECT cover_upload_count AS n FROM lists WHERE id = ?").bind(list.id).first()).n, 1);
    const changed = IMAGE.slice(); changed[30] = changed[30] === 1 ? 2 : 1;
    assert.equal((await h.call(path + "/cover", "PUT", changed, { owner: key(1) })).status, 429);
    assert.equal((await h.call(path, "PATCH", { coverId: "cover_01" }, { owner: key(1) })).data.coverImageUrl, "");
    assert.equal((await h.call(path + "/cover")).status, 404);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM list_covers").first()).n, 0);
  } finally { h.DB.close(); }
});
test("cover bounds and account deletion remove owned BLOB data", async () => {
  const h = harness();
  try {
    const account = (await h.call("/accounts", "POST", { name: "QA", accountKey: key(1), sessionToken: key(2) })).data;
    const list = (await h.call("/lists", "POST", { title: "Konto", ownerKey: key(3) }, { token: account.sessionToken })).data;
    const path = "/lists/" + list.id + "/cover", credentials = { token: account.sessionToken };
    assert.equal((await h.call(path, "PUT", new Uint8Array(200001), credentials)).status, 413);
    assert.equal((await h.call(path, "PUT", IMAGE, credentials, { "Content-Type": "image/png" })).status, 415);
    assert.equal((await h.call(path, "PUT", IMAGE, credentials)).status, 200);
    await h.DB.prepare("UPDATE lists SET cover_upload_at = 0, cover_upload_count = 10 WHERE id = ?").bind(list.id).run();
    const changed = IMAGE.slice(); changed[30] = changed[30] === 1 ? 2 : 1;
    assert.equal((await h.call(path, "PUT", changed, credentials)).status, 429);
    assert.equal((await h.call("/account", "DELETE", { currentKey: key(1) }, credentials)).status, 200);
    assert.equal((await h.call(path)).status, 404);
    assert.equal((await h.DB.prepare("SELECT COUNT(*) AS n FROM list_covers").first()).n, 0);
  } finally { h.DB.close(); }
});
