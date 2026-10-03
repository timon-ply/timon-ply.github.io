export const CLIENT_ITERATIONS = 600000;
export const SERVER_ITERATIONS = 100000;
export const CLIENT_SALT_PREFIX = "wunschkiste:timonply.com:v1:";
const HEX_32 = /^[a-f0-9]{32}$/, HEX_64 = /^[a-f0-9]{64}$/;
const encoder = new TextEncoder();
const bytes = value => Uint8Array.from(value.match(/../g), pair => parseInt(pair, 16));
const hex = value => Array.from(new Uint8Array(value), byte => byte.toString(16).padStart(2, "0")).join("");
export function canonicalUsername(value, fail) {
  const username = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[a-z0-9][a-z0-9_]{2,31}$/.test(username)) fail(400, "Benutzername: 3 bis 32 Zeichen, Buchstaben, Ziffern oder Unterstrich.");
  return username;
}
export function credentialInput(body, fail) {
  const username = canonicalUsername(body.username, fail);
  if (!HEX_64.test(body.authSecret || "") || !HEX_32.test(body.clientSalt || "") || body.kdfVersion !== 1) fail(400, "Bitte die Anmeldung erneut öffnen.");
  return { username, authSecret: body.authSecret, clientSalt: body.clientSalt };
}
export function validAuthSecret(value) { return typeof value === "string" && HEX_64.test(value); }
export async function serverVerifier(authSecret, salt) {
  if (!HEX_64.test(authSecret || "") || !HEX_32.test(salt || "")) throw new Error("invalid_credential_input");
  const key = await crypto.subtle.importKey("raw", bytes(authSecret), "PBKDF2", false, ["deriveBits"]);
  return hex(await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: bytes(salt), iterations: SERVER_ITERATIONS }, key, 256));
}
async function equalVerifier(left, right) {
  // WebCrypto verifies a fixed-size MAC in native crypto code, avoiding a
  // JavaScript string comparison or a JIT-dependent equality loop.
  const key = await crypto.subtle.importKey("raw", crypto.getRandomValues(new Uint8Array(32)), { name: "HMAC", hash: "SHA-256" }, false, ["sign", "verify"]);
  const signature = await crypto.subtle.sign("HMAC", key, bytes(left));
  return crypto.subtle.verify("HMAC", key, signature, bytes(right));
}
export async function verifySecret(account, authSecret) {
  if (!validAuthSecret(authSecret) || !HEX_32.test(account?.server_salt || "") || !HEX_64.test(account?.password_verifier || "") || account.kdf_version !== 1 || account.client_iterations !== CLIENT_ITERATIONS || account.server_iterations !== SERVER_ITERATIONS) return false;
  return equalVerifier(await serverVerifier(authSecret, account.server_salt), account.password_verifier);
}
export async function fakeSalt(username, setupKey) {
  const key = await crypto.subtle.importKey("raw", encoder.encode(setupKey), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  return hex(await crypto.subtle.sign("HMAC", key, encoder.encode("wunschkiste:unknown-user:v1:" + username))).slice(0, 32);
}
