const MAX_BODY = 16384;
const KEY = /^[a-f0-9]{64}$/;
const ID = /^[a-f0-9]{24}$/;
class ApiError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
function fail(status, message) { throw new ApiError(status, message); }
function randomHex(bytes = 32) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), x => x.toString(16).padStart(2, "0")).join("");
}
async function hash(value) {
  const bytes = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(bytes), x => x.toString(16).padStart(2, "0")).join("");
}
function text(value, maximum, required = false) {
  if (typeof value !== "string") fail(400, "Bitte die Angaben prüfen.");
  const result = value.trim();
  if (result.length > maximum || (required && !result)) fail(400, "Bitte die Angaben prüfen.");
  return result;
}
function safeUrl(value, image = false) {
  if (!value) return "";
  const result = text(value, 2000);
  let url;
  try { url = new URL(result); } catch { fail(400, "Bitte einen gültigen Link eintragen."); }
  if (!(image ? url.protocol === "https:" : ["https:", "http:"].includes(url.protocol)) ||
      url.username || url.password) fail(400, "Bitte einen gültigen http- oder https-Link eintragen.");
  return url.href;
}
function date(value) {
  if (!value) return "";
  const result = text(value, 10);
  if (!/^20\d{2}-\d{2}-\d{2}$/.test(result) ||
      Number.isNaN(Date.parse(result)) || new Date(result).toISOString().slice(0, 10) !== result) {
    fail(400, "Bitte ein gültiges Datum eintragen.");
  }
  return result;
}
function itemInput(body) {
  const price = body.priceCents ?? null;
  if (price !== null && (!Number.isSafeInteger(price) || price < 0 || price > 100000000)) {
    fail(400, "Bitte einen gültigen Preis eintragen.");
  }
  return {
    title: text(body.title, 90, true), url: safeUrl(body.url || ""),
    imageUrl: safeUrl(body.imageUrl || "", true), priceCents: price,
    note: text(body.note || "", 240)
  };
}
async function jsonBody(request) {
  if (!(request.headers.get("content-type") || "").startsWith("application/json")) fail(415, "JSON erforderlich.");
  if (Number(request.headers.get("content-length")) > MAX_BODY) fail(413, "Die Angaben sind zu groß.");
  const reader = request.body?.getReader();
  if (!reader) fail(400, "Die Angaben fehlen.");
  let size = 0;
  const chunks = [];
  while (true) {
    const part = await reader.read();
    if (part.done) break;
    size += part.value.byteLength;
    if (size > MAX_BODY) { await reader.cancel(); fail(413, "Die Angaben sind zu groß."); }
    chunks.push(part.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try {
    const body = JSON.parse(new TextDecoder().decode(bytes));
    if (!body || typeof body !== "object" || Array.isArray(body)) fail(400, "Bitte die Angaben prüfen.");
    return body;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    fail(400, "Bitte die Angaben prüfen.");
  }
}
function bearer(request) {
  const value = request.headers.get("authorization") || "";
  if (!value) return "";
  if (!/^Bearer [a-f0-9]{64}$/.test(value)) fail(403, "Der Verwaltungslink ist ungültig.");
  return value.slice(7);
}
async function owner(request, list) {
  const key = bearer(request);
  return Boolean(key && (await hash(key)) === list.owner_hash);
}
async function requireOwner(request, list) {
  if (!await owner(request, list)) fail(403, "Nur mit dem Verwaltungslink möglich.");
}
async function claimHash(request, required = false) {
  const key = request.headers.get("x-claim-key") || "";
  if (!key && !required) return "";
  if (!KEY.test(key)) fail(400, "Bitte die Seite erneut öffnen.");
  return hash(key);
}
async function listData(db, list, request) {
  const mine = await claimHash(request);
  const isOwner = await owner(request, list);
  const data = await db.prepare("SELECT * FROM items WHERE list_id = ? AND deleted = 0 ORDER BY created_at, id").bind(list.id).all();
  return {
    id: list.id, title: list.title, date: list.event_date, isOwner,
    items: data.results.map(row => ({
      id: row.id, title: row.title, url: row.url, imageUrl: row.image_url,
      priceCents: row.price_cents, note: row.note, revision: row.revision,
      status: row.claim_hash ? (row.purchased ? "purchased" : "reserved") : "open",
      mine: Boolean(mine && row.claim_hash === mine)
    }))
  };
}
async function route(request, env) {
  if (!env.DB) fail(503, "Die Liste ist gerade nicht erreichbar.");
  const db = env.DB;
  const path = new URL(request.url).pathname.replace(/^\/api/, "").replace(/\/$/, "");
  if (path === "/list" && request.method === "GET") {
    return { exists: Boolean(await db.prepare("SELECT id FROM lists WHERE slot = 1").first()) };
  }
  if (path === "/lists" && request.method === "POST") {
    if (env.DEV_MODE !== "true" && (!env.SETUP_KEY || request.headers.get("x-setup-key") !== env.SETUP_KEY)) {
      fail(403, "Zum Anlegen bitte den Einrichtungslink öffnen.");
    }
    const body = await jsonBody(request);
    const title = text(body.title, 80, true);
    const eventDate = date(body.date || "");
    const id = randomHex(12);
    const ownerKey = body.ownerKey;
    if (!KEY.test(ownerKey || "")) fail(400, "Bitte die Einrichtung erneut öffnen.");
    const ownerHash = await hash(ownerKey);
    const result = await db.prepare("INSERT OR IGNORE INTO lists (slot, id, title, event_date, owner_hash, created_at) VALUES (1, ?, ?, ?, ?, ?)")
      .bind(id, title, eventDate, ownerHash, Date.now()).run();
    if (!result.meta.changes) {
      const existing = await db.prepare("SELECT * FROM lists WHERE slot = 1").first();
      if (!existing || existing.owner_hash !== ownerHash) fail(409, "Die Testliste wurde bereits angelegt.");
      const replay = new Request(request.url, { headers: { ...Object.fromEntries(request.headers), Authorization:"Bearer " + ownerKey } });
      return { ...await listData(db, existing, replay), ownerKey };
    }
    return { id, title, date: eventDate, ownerKey, isOwner: true, items: [] };
  }
  const match = path.match(/^\/lists\/([a-f0-9]{24})(?:\/items(?:\/([a-f0-9]{24})(?:\/(reservation|restore))?)?)?$/);
  if (!match || !ID.test(match[1])) fail(404, "Dieser Link wurde nicht gefunden.");
  const list = await db.prepare("SELECT * FROM lists WHERE id = ?").bind(match[1]).first();
  if (!list) fail(404, "Diese Wunschliste wurde nicht gefunden.");
  const itemId = match[2];
  const isItemsPath = path.includes("/items");
  if (!isItemsPath && request.method === "GET") return listData(db, list, request);
  if (!isItemsPath && request.method === "PATCH") {
    await requireOwner(request, list);
    const body = await jsonBody(request);
    await db.prepare("UPDATE lists SET title = ?, event_date = ? WHERE id = ?")
      .bind(text(body.title, 80, true), date(body.date || ""), list.id).run();
    return listData(db, { ...list, title: body.title.trim(), event_date: body.date || "" }, request);
  }
  if (isItemsPath && !itemId && request.method === "POST") {
    await requireOwner(request, list);
    const item = itemInput(await jsonBody(request));
    const result = await db.prepare("INSERT INTO items (id, list_id, title, url, image_url, price_cents, note, created_at) SELECT ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM items WHERE list_id = ? AND deleted = 0) < 30 AND (SELECT COUNT(*) FROM items WHERE list_id = ?) < 100")
      .bind(randomHex(12), list.id, item.title, item.url, item.imageUrl, item.priceCents, item.note, Date.now(), list.id, list.id).run();
    if (!result.meta.changes) fail(409, "Die Testliste ist voll (maximal 30 Wünsche).");
    return listData(db, list, request);
  }
  if (!itemId) fail(405, "Diese Aktion ist nicht verfügbar.");
  const existing = await db.prepare("SELECT * FROM items WHERE id = ? AND list_id = ?").bind(itemId, list.id).first();
  if (!existing) fail(404, "Dieser Wunsch wurde nicht gefunden.");
  if (match[3] === "reservation" && request.method === "POST" && !existing.deleted) {
    const action = (await jsonBody(request)).action;
    const mine = await claimHash(request, action !== "release" || !await owner(request, list));
    let result;
    if (action === "reserve") {
      if (existing.claim_hash === mine) return listData(db, list, request);
      result = await db.prepare("UPDATE items SET claim_hash = ?, reserved_at = ?, purchased = 0 WHERE id = ? AND list_id = ? AND deleted = 0 AND claim_hash IS NULL")
        .bind(mine, Date.now(), itemId, list.id).run();
    } else if (action === "release") {
      if (await owner(request, list)) {
        result = await db.prepare("UPDATE items SET claim_hash = NULL, reserved_at = NULL, purchased = 0 WHERE id = ? AND list_id = ? AND deleted = 0")
          .bind(itemId, list.id).run();
      } else {
        result = await db.prepare("UPDATE items SET claim_hash = NULL, reserved_at = NULL, purchased = 0 WHERE id = ? AND list_id = ? AND deleted = 0 AND claim_hash = ?")
          .bind(itemId, list.id, mine).run();
      }
    } else if (action === "buy") {
      result = await db.prepare("UPDATE items SET purchased = 1 WHERE id = ? AND list_id = ? AND deleted = 0 AND claim_hash = ?")
        .bind(itemId, list.id, mine).run();
    } else fail(400, "Bitte die Aktion prüfen.");
    if (!result.meta.changes) fail(409, "Dieser Wunsch wurde inzwischen anders ausgewählt. Die Liste wird aktualisiert.");
    return listData(db, list, request);
  }
  await requireOwner(request, list);
  if (match[3] === "restore" && request.method === "POST") {
    const result = await db.prepare("UPDATE items SET deleted = 0, revision = revision + 1 WHERE id = ? AND list_id = ? AND deleted = 1 AND (SELECT COUNT(*) FROM items WHERE list_id = ? AND deleted = 0) < 30")
      .bind(itemId, list.id, list.id).run();
    if (!result.meta.changes) fail(409, "Der Wunsch konnte nicht wiederhergestellt werden.");
    return listData(db, list, request);
  }
  if (!match[3] && request.method === "PATCH" && !existing.deleted) {
    const body = await jsonBody(request);
    if (body.revision !== existing.revision) fail(409, "Der Wunsch wurde inzwischen geändert. Bitte erneut öffnen.");
    const item = itemInput(body);
    const result = await db.prepare("UPDATE items SET title = ?, url = ?, image_url = ?, price_cents = ?, note = ?, revision = revision + 1 WHERE id = ? AND list_id = ? AND deleted = 0 AND revision = ?")
      .bind(item.title, item.url, item.imageUrl, item.priceCents, item.note, itemId, list.id, body.revision).run();
    if (!result.meta.changes) fail(409, "Der Wunsch wurde inzwischen geändert. Bitte erneut öffnen.");
    return listData(db, list, request);
  }
  if (!match[3] && request.method === "DELETE" && !existing.deleted) {
    await db.prepare("UPDATE items SET deleted = 1, revision = revision + 1 WHERE id = ? AND list_id = ?").bind(itemId, list.id).run();
    return listData(db, list, request);
  }
  fail(405, "Diese Aktion ist nicht verfügbar.");
}
export default {
  async fetch(request, env) {
    const origin = request.headers.get("origin") || "";
    const allowed = origin === (env.ALLOWED_ORIGIN || "https://timonply.com") ||
      (env.DEV_MODE === "true" && /^http:\/\/(127\.0\.0\.1|localhost):\d+$/.test(origin));
    const headers = {
      "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store",
      "X-Content-Type-Options": "nosniff", "Referrer-Policy": "no-referrer", "Vary": "Origin"
    };
    if (allowed) Object.assign(headers, {
      "Access-Control-Allow-Origin": origin, "Access-Control-Allow-Methods": "GET, POST, PATCH, DELETE, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Claim-Key, X-Setup-Key"
    });
    if (request.method === "OPTIONS") return new Response(null, { status: allowed ? 204 : 403, headers });
    if (origin && !allowed) return new Response(JSON.stringify({ error: "Diese Website hat keinen Zugriff." }), { status: 403, headers });
    try { return new Response(JSON.stringify(await route(request, env)), { headers }); }
    catch (error) {
      const status = error instanceof ApiError ? error.status : 503;
      if (!(error instanceof ApiError)) console.error("wunschkiste_api_unavailable");
      return new Response(JSON.stringify({ error: error instanceof ApiError ? error.message : "Speichern gerade nicht möglich. Bitte erneut versuchen." }), { status, headers });
    }
  }
};
