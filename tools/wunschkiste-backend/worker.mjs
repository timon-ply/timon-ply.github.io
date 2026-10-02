import { productUrl, previewProduct } from "./product-preview.mjs";
import { accountService } from "./accounts.mjs";
const requestAccounts = new WeakMap();
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
  const account = requestAccounts.get(request);
  if (account && list.account_id === account.id) return true;
  const key = bearer(request);
  return Boolean(list.owner_link_enabled && key && (await hash(key)) === list.owner_hash);
}
async function requireOwner(request, list) {
  if (!await owner(request, list)) fail(403, "Nur mit dem Verwaltungslink möglich.");
}
async function claimHash(request, required = false) {
  const account = requestAccounts.get(request);
  if (account) return hash("account:" + account.id);
  const key = request.headers.get("x-claim-key") || "";
  if (!key && !required) return "";
  if (!KEY.test(key)) fail(400, "Bitte die Seite erneut öffnen.");
  return hash(key);
}
async function listData(db, list, request) {
  const mine = await claimHash(request);
  const isOwner = new URL(request.url).searchParams.get("guest") !== "1" && await owner(request, list);
  const data = await db.prepare("SELECT * FROM items WHERE list_id = ? AND deleted = 0 ORDER BY created_at, id").bind(list.id).all();
  return {
    id: list.id, title: list.title, date: list.event_date, description:list.description || "", isOwner,
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
  const accounts = accountService(request, env, { fail, hash, randomHex, text, jsonBody });
  const accountResult = await accounts.route(path);
  if (accountResult !== null) return accountResult;
  const account = await accounts.session();
  if (account) requestAccounts.set(request, account);
  if (path === "/list" && request.method === "GET") {
    // Earlier clients use this flag to decide whether to offer creation.
    return { exists: false };
  }
  if (path === "/lists" && request.method === "POST") {
    const body = await jsonBody(request);
    const title = text(body.title, 80, true);
    const eventDate = date(body.date || "");
    const description = text(body.description === undefined ? "" : body.description, 240);
    const id = randomHex(12);
    const ownerKey = body.ownerKey;
    if (!KEY.test(ownerKey || "")) fail(400, "Bitte die Erstellung erneut öffnen.");
    const ownerHash = await hash(ownerKey);
    const now = Date.now();
    // The pre-existing secret only salts the abuse counter; visitors need no setup key.
    if (env.DEV_MODE !== "true" && !env.SETUP_KEY) fail(503, "Die Erstellung ist gerade nicht verfügbar.");
    const creatorHash = await hash((env.SETUP_KEY || "local") + ":" + (request.headers.get("cf-connecting-ip") || "local"));
    const result = await db.prepare("INSERT OR IGNORE INTO lists (id, title, event_date, description, owner_hash, created_at, creator_hash, account_id, owner_link_enabled) SELECT ?, ?, ?, ?, ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM lists) < 500 AND (SELECT COUNT(*) FROM lists WHERE creator_hash = ? AND created_at > ?) < 5 AND (? IS NULL OR (SELECT COUNT(*) FROM lists WHERE account_id = ?) < 20)")
      .bind(id, title, eventDate, description, ownerHash, now, creatorHash, account?.id || null, account ? 0 : 1, creatorHash, now - 3600000, account?.id || null, account?.id || null).run();
    if (!result.meta.changes) {
      const existing = await db.prepare("SELECT * FROM lists WHERE owner_hash = ?").bind(ownerHash).first();
      if (!existing) fail(429, "Gerade können keine weiteren Wunschkisten erstellt werden. Bitte später erneut versuchen.");
      if (!existing.owner_link_enabled && existing.account_id !== account?.id) fail(403, "Bitte mit dem zugehörigen Konto anmelden.");
      const replay = new Request(request.url, { headers: { ...Object.fromEntries(request.headers), Authorization:"Bearer " + ownerKey } });
      if (account) requestAccounts.set(replay, account);
      return { ...await listData(db, existing, replay), ownerKey };
    }
    return { id, title, date: eventDate, description, ownerKey, isOwner: true, items: [] };
  }
  const match = path.match(/^\/lists\/([a-f0-9]{24})(?:\/(product-preview)|\/items(?:\/([a-f0-9]{24})(?:\/(reservation|restore))?)?)?$/);
  if (!match || !ID.test(match[1])) fail(404, "Dieser Link wurde nicht gefunden.");
  const list = await db.prepare("SELECT * FROM lists WHERE id = ?").bind(match[1]).first();
  if (!list) fail(404, "Diese Wunschliste wurde nicht gefunden.");
  if (match[2] === "product-preview") {
    if (request.method !== "POST") fail(405, "Diese Aktion ist nicht verfügbar.");
    await requireOwner(request, list);
    const body = await jsonBody(request);
    let url;
    try { url = productUrl(body.url); }
    catch { fail(400, "Für diesen Link bitte die Angaben selbst ergänzen."); }
    const now = Date.now(), day = Math.floor(now / 86400000);
    const budget = await db.prepare("UPDATE lists SET preview_count = CASE WHEN preview_day = ? THEN preview_count + 1 ELSE 1 END, preview_day = ?, preview_at = ? WHERE id = ? AND preview_at <= ? AND (preview_day <> ? OR preview_count < 60)")
      .bind(day, day, now, list.id, now - 2000, day).run();
    if (!budget.meta.changes) fail(429, "Bitte kurz warten oder die Angaben selbst ergänzen. Höchstens 60 Linkabrufe je Wunschkiste und Tag.");
    return previewProduct(url);
  }
  const itemId = match[3];
  const isItemsPath = path.includes("/items");
  if (!isItemsPath && request.method === "GET") return listData(db, list, request);
  if (!isItemsPath && request.method === "PATCH") {
    await requireOwner(request, list);
    const body = await jsonBody(request);
    const title=text(body.title,80,true), eventDate=date(body.date || "");
    if(body.description===undefined) {
      await db.prepare("UPDATE lists SET title = ?, event_date = ? WHERE id = ?").bind(title,eventDate,list.id).run();
    } else {
      const description=text(body.description,240);
      await db.prepare("UPDATE lists SET title = ?, event_date = ?, description = ? WHERE id = ?")
        .bind(title,eventDate,description,list.id).run();
    }
    return listData(db,await db.prepare("SELECT * FROM lists WHERE id = ?").bind(list.id).first(),request);
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
  if (match[4] === "reservation" && request.method === "POST" && !existing.deleted) {
    const action = (await jsonBody(request)).action;
    const mine = await claimHash(request, action !== "release" || !await owner(request, list));
    let result;
    if (action === "reserve") {
      if (existing.claim_hash === mine) return listData(db, list, request);
      result = await db.prepare("UPDATE items SET claim_hash = ?, reserved_at = ?, purchased = 0 WHERE id = ? AND list_id = ? AND deleted = 0 AND claim_hash IS NULL AND (? = 0 OR (SELECT COUNT(*) FROM items WHERE claim_hash = ? AND deleted = 0) < 50)")
        .bind(mine, Date.now(), itemId, list.id, account ? 1 : 0, mine).run();
      if (!result.meta.changes && account && !existing.claim_hash) fail(409, "Du kannst höchstens 50 Geschenke gleichzeitig reservieren.");
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
  if (match[4] === "restore" && request.method === "POST") {
    const result = await db.prepare("UPDATE items SET deleted = 0, revision = revision + 1 WHERE id = ? AND list_id = ? AND deleted = 1 AND (SELECT COUNT(*) FROM items WHERE list_id = ? AND deleted = 0) < 30 AND (? IS NULL OR NOT EXISTS (SELECT 1 FROM accounts WHERE claim_hash = ?) OR (SELECT COUNT(*) FROM items WHERE claim_hash = ? AND deleted = 0) < 50)")
      .bind(itemId, list.id, list.id, existing.claim_hash, existing.claim_hash, existing.claim_hash).run();
    if (!result.meta.changes) fail(409, "Der Wunsch konnte nicht wiederhergestellt werden.");
    return listData(db, list, request);
  }
  if (!match[4] && request.method === "PATCH" && !existing.deleted) {
    const body = await jsonBody(request);
    if (body.revision !== existing.revision) fail(409, "Der Wunsch wurde inzwischen geändert. Bitte erneut öffnen.");
    const item = itemInput(body);
    const result = await db.prepare("UPDATE items SET title = ?, url = ?, image_url = ?, price_cents = ?, note = ?, revision = revision + 1 WHERE id = ? AND list_id = ? AND deleted = 0 AND revision = ?")
      .bind(item.title, item.url, item.imageUrl, item.priceCents, item.note, itemId, list.id, body.revision).run();
    if (!result.meta.changes) fail(409, "Der Wunsch wurde inzwischen geändert. Bitte erneut öffnen.");
    return listData(db, list, request);
  }
  if (!match[4] && request.method === "DELETE" && !existing.deleted) {
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
      "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Claim-Key, X-Setup-Key, X-Session-Token"
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
