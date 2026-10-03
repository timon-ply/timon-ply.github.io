import { DEFAULT_COVER, ensureInviteCode } from "./list-metadata.mjs";
import { coverImageUrl } from "./custom-covers.mjs";
import { credentialRoutes } from "./credential-routes.mjs";
const KEY = /^[a-f0-9]{64}$/;
const ID = /^[a-f0-9]{24}$/;
const SESSION_MS = 30 * 86400000;

// Recovery keys and bearer sessions are independent random capabilities. Only
// their hashes are persisted; account identity supplies a stable claim hash.
export function accountService(request, env, { fail, hash, randomHex, text, jsonBody }) {
  const db = env.DB;
  let sessionPromise;
  function session(required = false) {
    sessionPromise ??= (async () => {
      const token = request.headers.get("x-session-token") || "";
      if (!token) return null;
      if (!KEY.test(token)) fail(401, "Bitte erneut anmelden.");
      const row = await db.prepare("SELECT a.*, s.id AS session_id FROM account_sessions s JOIN accounts a ON a.id = s.account_id AND a.auth_version = s.auth_version WHERE s.token_hash = ? AND s.expires_at > ?")
        .bind(await hash(token), Date.now()).first();
      if (!row) fail(401, "Die Anmeldung ist abgelaufen. Bitte erneut anmelden.");
      return row;
    })();
    return sessionPromise.then(row => { if (required && !row) fail(401, "Bitte anmelden."); return row; });
  }
  const publicAccount = account => ({ id: account.id, name: account.name, username: account.username || "", hasPassword: Boolean(account.password_verifier) });
  function recoveryKey(value) {
    if (!KEY.test(value || "")) fail(400, "Bitte einen gültigen Wiederherstellungsschlüssel eingeben.");
    return value;
  }
  async function throttle(scope = "auth") {
    const invites = scope === "invite";
    const table = invites ? "invite_buckets" : "auth_buckets";
    if (env.DEV_MODE !== "true" && !env.SETUP_KEY) fail(503, invites ? "Die Einladung ist gerade nicht erreichbar." : "Die Anmeldung ist gerade nicht verfügbar.");
    const digest = await hash((env.SETUP_KEY || "local") + (invites ? ":invite:" : ":auth:") + (request.headers.get("cf-connecting-ip") || "local"));
    const bucket = parseInt(digest.slice(0, 2), 16), window = Math.floor(Date.now() / 3600000);
    const result = await db.prepare(`INSERT INTO ${table} (bucket, window, attempts) VALUES (?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET window = excluded.window, attempts = CASE WHEN ${table}.window = excluded.window THEN ${table}.attempts + 1 ELSE 1 END WHERE ${table}.window <> excluded.window OR ${table}.attempts < 30`)
      .bind(bucket, window).run();
    if (!result.meta.changes) fail(429, invites ? "Zu viele Codeversuche. Bitte später erneut versuchen." : "Zu viele Anmeldeversuche. Bitte später erneut versuchen.");
  }
  async function issueSession(account, deviceName, keyHash, token) {
    if (!KEY.test(token || "")) fail(400, "Bitte die Anmeldung erneut öffnen.");
    const now = Date.now(), expiresAt = now + SESSION_MS, tokenHash = await hash(token);
    await db.prepare("DELETE FROM account_sessions WHERE account_id = ? AND (expires_at <= ? OR auth_version <> (SELECT auth_version FROM accounts WHERE id = ?))")
      .bind(account.id, now, account.id).run();
    await db.prepare("INSERT OR IGNORE INTO account_sessions (id, account_id, token_hash, auth_version, device_name, created_at, expires_at) SELECT ?, id, ?, auth_version, ?, ?, ? FROM accounts WHERE id = ? AND key_hash = ? AND auth_version = ? AND (SELECT COUNT(*) FROM account_sessions WHERE account_id = ? AND expires_at > ?) < 10")
      .bind(randomHex(12), tokenHash, deviceName, now, expiresAt, account.id, keyHash, account.auth_version, account.id, now).run();
    const issued = await db.prepare("SELECT s.expires_at FROM account_sessions s JOIN accounts a ON a.id = s.account_id AND a.auth_version = s.auth_version WHERE s.account_id = ? AND s.token_hash = ? AND a.key_hash = ? AND a.auth_version = ? AND s.expires_at > ?")
      .bind(account.id, tokenHash, keyHash, account.auth_version, now).first();
    if (!issued) fail(409, "Anmeldung nicht möglich. Bitte ein altes Gerät abmelden oder den Schlüssel prüfen.");
    return { account: publicAccount(account), sessionToken: token, expiresAt: issued.expires_at };
  }
  const credentials = credentialRoutes(request, env, { fail, hash, randomHex, text }, { session, issueSession, throttle, publicAccount });
  async function route(path) {
    if (path === "/auth/parameters" && request.method === "GET") return credentials.parameters();
    if (!["/accounts", "/sessions"].includes(path) && !path.startsWith("/account")) return null;
    const method = request.method;
    if ((path === "/accounts" || path === "/sessions") && method === "POST") {
      await throttle();
      const body = await jsonBody(request);
      if (body.username !== undefined || body.authSecret !== undefined) return credentials.authenticate(path, body);
      const keyHash = await hash(recoveryKey(body.accountKey));
      if (!KEY.test(body.sessionToken || "") || body.sessionToken === body.accountKey) fail(400, "Bitte die Anmeldung erneut öffnen.");
      const deviceName = text(body.deviceName || "Dieses Gerät", 60, true);
      if (path === "/accounts") {
        const name = text(body.name, 60, true);
        const id = randomHex(12);
        await db.prepare("INSERT OR IGNORE INTO accounts (id, name, key_hash, claim_hash, created_at) SELECT ?, ?, ?, ?, ? WHERE (SELECT COUNT(*) FROM accounts) < 500")
          .bind(id, name, keyHash, await hash("account:" + id), Date.now()).run();
      }
      const account = await db.prepare("SELECT * FROM accounts WHERE key_hash = ?").bind(keyHash).first();
      if (!account) fail(path === "/accounts" ? 429 : 401, path === "/accounts" ? "Gerade können keine weiteren Konten erstellt werden." : "Dieser Wiederherstellungsschlüssel ist ungültig.");
      return issueSession(account, deviceName, keyHash, body.sessionToken);
    }
    // Retrying a rotation after a lost response must work with the persisted new
    // key even though the old session was atomically invalidated by the update.
    if (path === "/account/rotate-key" && method === "POST") {
      await throttle();
      const body = await jsonBody(request);
      const previousHash = await hash(recoveryKey(body.currentKey));
      const nextHash = await hash(recoveryKey(body.newKey));
      if (!KEY.test(body.sessionToken || "") || [body.currentKey, body.newKey].includes(body.sessionToken)) fail(400, "Bitte die Anmeldung erneut öffnen.");
      if (previousHash === nextHash) fail(400, "Bitte einen neuen Schlüssel verwenden.");
      const deviceName = text(body.deviceName || "Dieses Gerät", 60, true);
      const original = await db.prepare("SELECT * FROM accounts WHERE key_hash = ? OR (key_hash = ? AND previous_key_hash = ?)").bind(previousHash, nextHash, previousHash).first();
      if (!original) fail(401, "Dieser Wiederherstellungsschlüssel ist ungültig.");
      // Prevent a UNIQUE collision becoming an opaque failure; keys from other
      // accounts can never be assigned or used to transfer account ownership.
      const collision = await db.prepare("SELECT id FROM accounts WHERE key_hash = ? AND id <> ?").bind(nextHash, original.id).first();
      if (collision) fail(409, "Bitte einen anderen neuen Schlüssel verwenden.");
      await db.prepare("UPDATE accounts SET previous_key_hash = key_hash, key_hash = ?, auth_version = auth_version + 1 WHERE id = ? AND key_hash = ?")
        .bind(nextHash, original.id, previousHash).run();
      const updated = await db.prepare("SELECT * FROM accounts WHERE id = ? AND key_hash = ? AND previous_key_hash = ?").bind(original.id, nextHash, previousHash).first();
      if (!updated) fail(409, "Der Schlüssel wurde inzwischen geändert. Bitte erneut anmelden.");
      return issueSession(updated, deviceName, nextHash, body.sessionToken);
    }
    if (path === "/account/password" && method === "PUT") return credentials.change(await jsonBody(request));
    const account = await session(true);
    if (path === "/account/credentials" && method === "PUT") return credentials.bind(account, await jsonBody(request));
    if (path === "/account" && method === "GET") return { account: publicAccount(account) };
    if (path === "/account" && method === "PATCH") {
      const name = text((await jsonBody(request)).name, 60, true);
      await db.prepare("UPDATE accounts SET name = ? WHERE id = ?").bind(name, account.id).run();
      return { account: publicAccount({ ...account, name }) };
    }
    if (path === "/account" && method === "DELETE") {
      const body = await jsonBody(request);
      if (body.authSecret !== undefined) {
        await credentials.reauthenticate(account, body.authSecret);
        const result = await db.prepare("DELETE FROM accounts WHERE id = ? AND auth_version = ? AND password_verifier = ?").bind(account.id, account.auth_version, account.password_verifier).run();
        if (!result.meta.changes) fail(409, "Der Kontozugriff wurde inzwischen geändert. Bitte erneut anmelden.");
        return { deleted: true };
      }
      const currentHash = await hash(recoveryKey(body.currentKey));
      const result = await db.prepare("DELETE FROM accounts WHERE id = ? AND key_hash = ?").bind(account.id, currentHash).run();
      if (!result.meta.changes) fail(401, "Dieser Wiederherstellungsschlüssel ist ungültig.");
      return { deleted: true };
    }
    if (path === "/account/lists" && method === "GET") {
      const rows = await db.prepare("SELECT l.*, (SELECT COUNT(*) FROM items i WHERE i.list_id = l.id AND i.deleted = 0) AS item_count FROM lists l WHERE account_id = ? ORDER BY created_at DESC, id")
        .bind(account.id).all();
      return { lists: await Promise.all(rows.results.map(async row => ({ id: row.id, title: row.title, date: row.event_date, description: row.description,
        coverId: row.cover_id || DEFAULT_COVER, coverImageUrl: coverImageUrl(row, request), inviteCode: await ensureInviteCode(db, row, randomHex, fail), itemCount: row.item_count }))) };
    }
    if (path === "/account/lists/attach" && method === "POST") {
      const body = await jsonBody(request);
      if (!ID.test(body.listId || "")) fail(400, "Bitte den Wunschkisten-Link prüfen.");
      const ownerHash = await hash(recoveryKey(body.ownerKey));
      const result = await db.prepare("UPDATE lists SET account_id = ? WHERE id = ? AND owner_hash = ? AND (account_id = ? OR (account_id IS NULL AND (SELECT COUNT(*) FROM lists WHERE account_id = ?) < 20))")
        .bind(account.id, body.listId, ownerHash, account.id, account.id).run();
      if (!result.meta.changes) fail(403, "Die Wunschkiste lässt sich diesem Konto nicht zuordnen.");
      return { attached: true, listId: body.listId };
    }
    if (path === "/account/claims/attach" && method === "POST") {
      const body = await jsonBody(request);
      if (!KEY.test(body.claimKey || "")) fail(400, "Bitte den bisherigen Gastzugriff prüfen.");
      const previous = await hash(body.claimKey), mine = await hash("account:" + account.id);
      const result = await db.prepare("UPDATE items SET claim_hash = ? WHERE claim_hash = ? AND (SELECT COUNT(*) FROM items WHERE deleted = 0 AND claim_hash IN (?, ?)) <= 50")
        .bind(mine, previous, mine, previous).run();
      if (!result.meta.changes && await db.prepare("SELECT id FROM items WHERE claim_hash = ? LIMIT 1").bind(previous).first()) fail(409, "Mit diesen Reservierungen würde die Grenze von 50 aktiven Geschenken überschritten.");
      return { attached: true, reservations: result.meta.changes };
    }
    if (path === "/account/join" && method === "POST") {
      const body = await jsonBody(request);
      if (!ID.test(body.listId || "")) fail(400, "Bitte den Wunschkisten-Link prüfen.");
      if (!await db.prepare("SELECT id FROM lists WHERE id = ?").bind(body.listId).first()) fail(404, "Diese Wunschkiste wurde nicht gefunden.");
      const exists = await db.prepare("SELECT list_id FROM account_joins WHERE account_id = ? AND list_id = ?").bind(account.id, body.listId).first();
      if (!exists) {
        const result = await db.prepare("INSERT OR IGNORE INTO account_joins (account_id, list_id, created_at) SELECT ?, ?, ? WHERE (SELECT COUNT(*) FROM account_joins WHERE account_id = ?) < 50")
          .bind(account.id, body.listId, Date.now(), account.id).run();
        if (!result.meta.changes) fail(409, "Du kannst höchstens 50 Einladungen speichern.");
      }
      return { joined: true, listId: body.listId };
    }
    if (path === "/account/gifts" && method === "GET") {
      const mine = await hash("account:" + account.id);
      const rows = await db.prepare("SELECT DISTINCT l.* FROM lists l WHERE l.id IN (SELECT list_id FROM account_joins WHERE account_id = ?) OR l.id IN (SELECT list_id FROM items WHERE claim_hash = ? AND deleted = 0) ORDER BY l.created_at DESC")
        .bind(account.id, mine).all();
      const claimed = await db.prepare("SELECT * FROM items WHERE claim_hash = ? AND deleted = 0 ORDER BY created_at, id").bind(mine).all();
      const byList = new Map();
      for (const row of claimed.results) {
        if (!byList.has(row.list_id)) byList.set(row.list_id, []);
        byList.get(row.list_id).push(row);
      }
      const lists = [];
      for (const list of rows.results) {
        lists.push({ id: list.id, title: list.title, date: list.event_date, description: list.description, coverId: list.cover_id || DEFAULT_COVER, coverImageUrl: coverImageUrl(list, request), items: (byList.get(list.id) || []).map(row => ({
          id: row.id, title: row.title, url: row.url, imageUrl: row.image_url, priceCents: row.price_cents, note: row.note, revision: row.revision,
          status: row.purchased ? "purchased" : "reserved", mine: true
        })) });
      }
      return { lists };
    }
    if (path === "/account/sessions" && method === "GET") {
      const rows = await db.prepare("SELECT id, device_name, created_at, expires_at FROM account_sessions WHERE account_id = ? AND auth_version = ? AND expires_at > ? ORDER BY created_at DESC")
        .bind(account.id, account.auth_version, Date.now()).all();
      return { sessions: rows.results.map(row => ({ id: row.id, deviceName: row.device_name, createdAt: row.created_at, expiresAt: row.expires_at, current: row.id === account.session_id })) };
    }
    const revoke = path.match(/^\/account\/sessions\/([a-f0-9]{24})$/);
    if ((revoke && method === "DELETE") || (path === "/account/logout" && method === "POST")) {
      await db.prepare("DELETE FROM account_sessions WHERE id = ? AND account_id = ?").bind(revoke ? revoke[1] : account.session_id, account.id).run();
      return { revoked: true };
    }
    fail(404, "Diese Kontoaktion wurde nicht gefunden.");
  }
  return { session, route, throttle };
}
