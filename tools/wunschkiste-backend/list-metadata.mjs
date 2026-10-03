export const DEFAULT_COVER = "cover_01";
export function validCover(value) {
  return typeof value === "string" && /^cover_(?:0[1-9]|[12][0-9]|3[0-9]|40)$/.test(value);
}
export function normalizeInviteCode(value) {
  if (typeof value !== "string" || value.length > 32) return "";
  const code = value.replace(/[\s-]/g, "").toLowerCase();
  return /^[a-f0-9]{10}$/.test(code) ? code : "";
}
export async function ensureInviteCode(db, list, randomHex, fail) {
  if (list.invite_code) return list.invite_code;
  for (let attempt = 0; attempt < 3; attempt++) {
    const code = randomHex(5);
    await db.prepare("UPDATE OR IGNORE lists SET invite_code = ? WHERE id = ? AND invite_code IS NULL").bind(code, list.id).run();
    const current = await db.prepare("SELECT invite_code FROM lists WHERE id = ?").bind(list.id).first();
    if (current?.invite_code) return current.invite_code;
  }
  fail(503, "Der Einladungscode konnte gerade nicht erstellt werden. Bitte erneut versuchen.");
}
