export const MAX_COVER_BYTES = 200000;
export function coverImageUrl(list, request) {
  return /^[a-f0-9]{64}$/.test(list.cover_hash || "") ? new URL(`/api/lists/${list.id}/cover?v=${list.cover_hash}`, request.url).href : "";
}

// Validate the supported baseline/progressive JPEG structure and bound decoded
// dimensions. Do not execute/decode uploaded content. Strip EXIF, comments and
// every APP segment before storage so embedded location/camera data is removed.
export function sanitizeJpeg(data) {
  const bad = () => { throw new Error("Bitte ein gültiges JPEG mit höchstens 2048 × 2048 Pixeln auswählen."); };
  if (!(data instanceof Uint8Array) || data.length < 20 || data.length > MAX_COVER_BYTES || data[0] !== 255 || data[1] !== 216) bad();
  const chunks = [data.subarray(0, 2)];
  let offset = 2, frames = 0, scans = 0, width = 0, height = 0, components = 0, quantization = false, huffman = false, segments = 0;
  while (offset < data.length && ++segments <= 512) {
    const start = offset;
    if (data[offset++] !== 255) bad();
    while (data[offset] === 255) offset++;
    const marker = data[offset++];
    if (marker === 217) {
      if (offset !== data.length || frames !== 1 || scans < 1 || !quantization || !huffman) bad();
      chunks.push(data.subarray(start, offset));
      const result = new Uint8Array(chunks.reduce((sum, chunk) => sum + chunk.length, 0));
      let cursor = 0;
      for (const chunk of chunks) { result.set(chunk, cursor); cursor += chunk.length; }
      return { bytes: result, width, height };
    }
    if (offset + 2 > data.length || marker === 0 || marker === 216 || (marker >= 208 && marker <= 215)) bad();
    const length = data[offset] * 256 + data[offset + 1], end = offset + length;
    if (length < 2 || end > data.length) bad();
    if (marker === 192 || marker === 194) {
      if (++frames > 1 || length < 11 || data[offset + 2] !== 8) bad();
      height = data[offset + 3] * 256 + data[offset + 4];
      width = data[offset + 5] * 256 + data[offset + 6];
      components = data[offset + 7];
      if (![1, 3].includes(components) || length !== 8 + 3 * components || width < 1 || height < 1 || width > 2048 || height > 2048 || width * height > 4000000) bad();
    } else if (marker >= 193 && marker <= 207 && ![196].includes(marker)) bad();
    if (marker === 219) quantization = true;
    if (marker === 196) huffman = true;
    if ((marker < 224 || marker > 239) && marker !== 254) chunks.push(data.subarray(start, end));
    offset = end;
    if (marker === 218) {
      if (!frames || ++scans > 128 || length < 8 || data[end - length + 2] < 1 || data[end - length + 2] > components || length !== 6 + 2 * data[end - length + 2]) bad();
      const scanStart = offset;
      while (offset < data.length) {
        if (data[offset] !== 255) { offset++; continue; }
        if (data[offset + 1] === 0 || (data[offset + 1] >= 208 && data[offset + 1] <= 215)) { offset += 2; continue; }
        if (data[offset + 1] === 255) { offset++; continue; }
        break;
      }
      if (offset === scanStart || offset >= data.length) bad();
      chunks.push(data.subarray(scanStart, offset));
    }
  }
  bad();
}

export async function readCoverUpload(request, fail) {
  if ((request.headers.get("content-type") || "").split(";")[0].trim().toLowerCase() !== "image/jpeg") fail(415, "Bitte das Bild als JPEG senden.");
  if (Number(request.headers.get("content-length")) > MAX_COVER_BYTES) fail(413, "Das Cover darf höchstens 200 KB groß sein.");
  const reader = request.body?.getReader();
  if (!reader) fail(400, "Bitte ein Bild auswählen.");
  const chunks = [];
  let size = 0;
  while (true) {
    const chunk = await reader.read();
    if (chunk.done) break;
    size += chunk.value.length;
    if (size > MAX_COVER_BYTES) { await reader.cancel(); fail(413, "Das Cover darf höchstens 200 KB groß sein."); }
    chunks.push(chunk.value);
  }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.length; }
  try { return sanitizeJpeg(bytes).bytes; } catch (error) { fail(400, error.message); }
}

export async function storeCover(db, list, request, fail) {
  const bytes = await readCoverUpload(request, fail);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  const sha256 = Array.from(new Uint8Array(digest), byte => byte.toString(16).padStart(2, "0")).join("");
  const existing = await db.prepare("SELECT sha256 FROM list_covers WHERE list_id = ?").bind(list.id).first();
  if (existing?.sha256 === sha256) return;
  const now = Date.now(), day = Math.floor(now / 86400000);
  const result = await db.prepare("INSERT INTO list_covers (list_id, jpeg, sha256, updated_at) SELECT id, ?, ?, ? FROM lists WHERE id = ? AND cover_upload_at <= ? AND (cover_upload_day <> ? OR cover_upload_count < 10) ON CONFLICT(list_id) DO UPDATE SET jpeg = excluded.jpeg, sha256 = excluded.sha256, updated_at = excluded.updated_at")
    .bind(bytes, sha256, now, list.id, now - 2000, day).run();
  if (!result.meta.changes) fail(429, "Bitte kurz warten. Höchstens zehn Cover-Uploads je Kiste und Tag.");
}

export async function getCover(db, listId, request, fail) {
  const row = await db.prepare("SELECT jpeg, sha256 FROM list_covers WHERE list_id = ?").bind(listId).first();
  if (!row) fail(404, "Dieses Cover wurde nicht gefunden.");
  const headers = { "Content-Type": "image/jpeg", "Cache-Control": "public, max-age=60, must-revalidate", "ETag": `"${row.sha256}"`, "X-Content-Type-Options": "nosniff", "Content-Security-Policy": "default-src 'none'; sandbox" };
  if (request.headers.get("if-none-match") === headers.ETag) return new Response(null, { status: 304, headers });
  return new Response(row.jpeg instanceof Uint8Array ? row.jpeg : new Uint8Array(row.jpeg), { headers });
}
