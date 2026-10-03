import { CLIENT_ITERATIONS, SERVER_ITERATIONS, canonicalUsername, credentialInput, validAuthSecret, serverVerifier, verifySecret, fakeSalt } from "./passwords.mjs";
const KEY = /^[a-f0-9]{64}$/;
export function credentialRoutes(request, env, helpers, auth) {
  const { fail, hash, randomHex, text } = helpers, db = env.DB;
  function enabled() {
    if (env.DEV_MODE !== "true" && env.PASSWORD_AUTH_ENABLED !== "true") fail(503, "Die Passwortanmeldung ist gerade nicht verfügbar.");
  }
  function sessionToken(body) {
    if (!KEY.test(body.sessionToken || "") || body.sessionToken === body.accountKey || body.sessionToken === body.authSecret || body.sessionToken === body.newAuthSecret) fail(400, "Bitte die Anmeldung erneut öffnen.");
    return body.sessionToken;
  }
  async function usernameBudget(username) {
    const digest = await hash((env.SETUP_KEY || "local") + ":credential:" + username);
    const bucket = parseInt(digest.slice(0, 2), 16), window = Math.floor(Date.now() / 3600000);
    const result = await db.prepare("INSERT INTO credential_buckets (bucket, window, attempts) VALUES (?, ?, 1) ON CONFLICT(bucket) DO UPDATE SET window = excluded.window, attempts = CASE WHEN credential_buckets.window = excluded.window THEN credential_buckets.attempts + 1 ELSE 1 END WHERE credential_buckets.window <> excluded.window OR credential_buckets.attempts < 20").bind(bucket, window).run();
    if (!result.meta.changes) fail(429, "Zu viele Anmeldeversuche. Bitte später erneut versuchen.");
  }
  async function parameters() {
    enabled();
    await auth.throttle();
    const username = canonicalUsername(new URL(request.url).searchParams.get("username"), fail);
    const account = await db.prepare("SELECT client_salt FROM accounts WHERE username = ?").bind(username).first();
    return { clientSalt: account?.client_salt || await fakeSalt(username, env.SETUP_KEY || "local"), kdfVersion: 1, iterations: CLIENT_ITERATIONS };
  }
  async function authenticate(path, body) {
    enabled();
    const username = canonicalUsername(body.username, fail), token = sessionToken(body);
    if (!validAuthSecret(body.authSecret)) fail(400, "Bitte die Anmeldung erneut öffnen.");
    await usernameBudget(username);
    const deviceName = text(body.deviceName || "Dieses Gerät", 60, true);
    let account;
    if (path === "/accounts") {
      const input = credentialInput(body, fail);
      if (!KEY.test(body.accountKey || "") || body.accountKey === body.authSecret) fail(400, "Bitte die Erstellung erneut öffnen.");
      const keyHash = await hash(body.accountKey);
      account = await db.prepare("SELECT * FROM accounts WHERE key_hash = ?").bind(keyHash).first();
      if (!account) {
        if (await db.prepare("SELECT id FROM accounts WHERE username = ?").bind(username).first()) fail(409, "Dieser Benutzername ist bereits vergeben.");
        const salt = randomHex(16), verifier = await serverVerifier(input.authSecret, salt), id = randomHex(12);
        const name = text(body.name === undefined ? username : body.name, 60, true);
        await db.prepare("INSERT OR IGNORE INTO accounts (id,name,key_hash,claim_hash,created_at,username,client_salt,server_salt,password_verifier,kdf_version,client_iterations,server_iterations) SELECT ?,?,?,?,?,?,?,?,?,1,?,? WHERE (SELECT COUNT(*) FROM accounts) < 500")
          .bind(id, name, keyHash, await hash("account:" + id), Date.now(), username, input.clientSalt, salt, verifier, CLIENT_ITERATIONS, SERVER_ITERATIONS).run();
        account = await db.prepare("SELECT * FROM accounts WHERE key_hash = ?").bind(keyHash).first();
        if (!account) {
          if (await db.prepare("SELECT id FROM accounts WHERE username = ?").bind(username).first()) fail(409, "Dieser Benutzername ist bereits vergeben.");
          fail(429, "Gerade können keine weiteren Konten erstellt werden.");
        }
        // A successful insert already used this verifier; avoid a second KDF.
        if (account.id === id) return auth.issueSession(account, deviceName, keyHash, token);
      }
      if (account.username !== username || account.client_salt !== input.clientSalt || !await verifySecret(account, input.authSecret)) fail(409, "Diese Kontoerstellung konnte nicht erneut bestätigt werden.");
    } else {
      account = await db.prepare("SELECT * FROM accounts WHERE username = ?").bind(username).first();
      if (!account) {
        await serverVerifier(body.authSecret, await fakeSalt("server:" + username, env.SETUP_KEY || "local"));
        fail(401, "Benutzername oder Passwort ist falsch.");
      }
      if (!await verifySecret(account, body.authSecret)) fail(401, "Benutzername oder Passwort ist falsch.");
    }
    return auth.issueSession(account, deviceName, account.key_hash, token);
  }
  async function bind(account, body) {
    enabled();
    await auth.throttle();
    const input = credentialInput(body, fail);
    await usernameBudget(input.username);
    if (account.username) {
      if (account.username === input.username && account.client_salt === input.clientSalt && await verifySecret(account, input.authSecret)) return { account: auth.publicAccount(account) };
      fail(409, "Dieses Konto hat bereits einen Benutzernamen. Nutze die Passwortänderung.");
    }
    if (await db.prepare("SELECT id FROM accounts WHERE username = ?").bind(input.username).first()) fail(409, "Dieser Benutzername ist bereits vergeben.");
    const salt = randomHex(16), verifier = await serverVerifier(input.authSecret, salt);
    const result = await db.prepare("UPDATE OR IGNORE accounts SET username = ?, client_salt = ?, server_salt = ?, password_verifier = ?, kdf_version = 1, client_iterations = ?, server_iterations = ? WHERE id = ? AND username IS NULL AND auth_version = ?")
      .bind(input.username, input.clientSalt, salt, verifier, CLIENT_ITERATIONS, SERVER_ITERATIONS, account.id, account.auth_version).run();
    const updated = await db.prepare("SELECT * FROM accounts WHERE id = ?").bind(account.id).first();
    if (!result.meta.changes && !(updated?.username === input.username && updated?.client_salt === input.clientSalt && await verifySecret(updated, input.authSecret))) fail(409, "Der Benutzername konnte nicht zugeordnet werden. Bitte erneut prüfen.");
    return { account: auth.publicAccount(updated) };
  }
  async function change(body) {
    enabled();
    await auth.throttle();
    const token = sessionToken(body), tokenHash = await hash(token);
    if (!validAuthSecret(body.newAuthSecret) || !/^[a-f0-9]{32}$/.test(body.clientSalt || "") || body.kdfVersion !== 1) fail(400, "Bitte die Passwortänderung erneut öffnen.");
    const deviceName = text(body.deviceName || "Dieses Gerät", 60, true);
    // A lost response may leave the old request session invalid. The persisted
    // attempt token plus the newly derived credential authenticate this replay.
    const replay = await db.prepare("SELECT * FROM accounts WHERE password_change_token_hash = ?").bind(tokenHash).first();
    if (replay) {
      await usernameBudget(replay.username);
      if (replay.client_salt !== body.clientSalt || !await verifySecret(replay, body.newAuthSecret)) fail(401, "Die Passwortänderung konnte nicht bestätigt werden.");
      return auth.issueSession(replay, deviceName, replay.key_hash, token);
    }
    const account = await auth.session(true);
    if (!account.username) fail(409, "Lege zuerst einen Benutzernamen und ein Passwort fest.");
    await usernameBudget(account.username);
    if (!await verifySecret(account, body.currentAuthSecret)) fail(401, "Das aktuelle Passwort ist falsch.");
    if (body.newAuthSecret === body.currentAuthSecret || body.clientSalt === account.client_salt) fail(400, "Bitte neue Passwortangaben verwenden.");
    if (await db.prepare("SELECT id FROM account_sessions WHERE token_hash = ?").bind(tokenHash).first()) fail(400, "Bitte die Passwortänderung erneut öffnen.");
    const salt = randomHex(16), verifier = await serverVerifier(body.newAuthSecret, salt);
    const result = await db.prepare("UPDATE OR IGNORE accounts SET client_salt = ?, server_salt = ?, password_verifier = ?, password_change_token_hash = ?, auth_version = auth_version + 1 WHERE id = ? AND auth_version = ? AND password_verifier = ?")
      .bind(body.clientSalt, salt, verifier, tokenHash, account.id, account.auth_version, account.password_verifier).run();
    if (!result.meta.changes) fail(409, "Das Passwort wurde inzwischen geändert. Bitte erneut anmelden.");
    const updated = await db.prepare("SELECT * FROM accounts WHERE id = ? AND password_change_token_hash = ? AND auth_version = ?")
      .bind(account.id, tokenHash, account.auth_version + 1).first();
    if (!updated) fail(409, "Das Passwort wurde inzwischen geändert. Bitte erneut anmelden.");
    return auth.issueSession(updated, deviceName, updated.key_hash, token);
  }
  async function reauthenticate(account, secret) {
    enabled();
    await auth.throttle();
    if (!account.username) fail(401, "Bitte den Kontozugriff erneut bestätigen.");
    await usernameBudget(account.username);
    if (!await verifySecret(account, secret)) fail(401, "Das aktuelle Passwort ist falsch.");
  }
  return { parameters, authenticate, bind, change, reauthenticate };
}
