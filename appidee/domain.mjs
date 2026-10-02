export function esc(value) {
  return String(value ?? "").replace(/[&<>"']/g, char => ({ "&":"&amp;", "<":"&lt;", ">":"&gt;", '"':"&quot;", "'":"&#39;" })[char]);
}
export function randomKey(bytes = 32) {
  return Array.from(crypto.getRandomValues(new Uint8Array(bytes)), x => x.toString(16).padStart(2, "0")).join("");
}
export function normalizeUrl(value, image = false) {
  const text = String(value || "").trim();
  if (!text) return "";
  const candidate = /^[\w.-]+\.[a-z]{2,}(?:[/:?#]|$)/i.test(text) ? "https://" + text : text;
  let url;
  try { url = new URL(candidate); } catch { throw new Error("Bitte einen gültigen Produktlink eintragen."); }
  if (url.username || url.password || !(image ? url.protocol === "https:" : ["http:", "https:"].includes(url.protocol))) {
    throw new Error(image ? "Der Bildlink muss mit https:// beginnen." : "Bitte einen http- oder https-Link eintragen.");
  }
  if (url.href.length > 2000) throw new Error("Dieser Link ist zu lang.");
  return url.href;
}
export function parsePrice(value) {
  const text = String(value ?? "").trim();
  if (!text) return null;
  if (!/^\d{1,7}(?:[.,]\d{1,2})?$/.test(text)) throw new Error("Bitte einen Preis wie 49,99 eintragen.");
  const cents = Math.round(Number(text.replace(",", ".")) * 100);
  if (!Number.isSafeInteger(cents) || cents > 100000000) throw new Error("Bitte den Preis prüfen.");
  return cents;
}
export function priceText(cents) {
  return cents === null || cents === undefined ? "" : new Intl.NumberFormat("de-DE", { style:"currency", currency:"EUR" }).format(cents / 100);
}
export function shopDomain(url) {
  return url ? new URL(normalizeUrl(url)).hostname.replace(/^www\./, "") : "";
}
export function cleanPublicList(list) {
  if (!list || !/^[a-f0-9]{24}$/.test(list.id) || typeof list.title !== "string" ||
      !list.title.trim() || list.title.length > 80 || !Array.isArray(list.items) || list.items.length > 30) {
    throw new Error("Dieser Listenlink ist ungültig.");
  }
  const eventDate = String(list.date || "");
  if (eventDate && (!/^20\d{2}-\d{2}-\d{2}$/.test(eventDate) ||
      Number.isNaN(Date.parse(eventDate)) || new Date(eventDate).toISOString().slice(0,10) !== eventDate)) {
    throw new Error("Dieser Listenlink ist ungültig.");
  }
  const seen = new Set();
  return {
    id:list.id, title:list.title.trim(), date:eventDate,
    items:list.items.map(item => {
      if (!item || !/^[a-f0-9]{24}$/.test(item.id) || seen.has(item.id) ||
          typeof item.title !== "string" || !item.title.trim() || item.title.length > 90 ||
          (item.priceCents !== null && item.priceCents !== undefined &&
           (!Number.isSafeInteger(item.priceCents) || item.priceCents < 0 || item.priceCents > 100000000)) ||
          String(item.note || "").length > 240) throw new Error("Dieser Listenlink ist ungültig.");
      seen.add(item.id);
      return { id:item.id, title:item.title.trim(), url:normalizeUrl(item.url || ""),
        imageUrl:normalizeUrl(item.imageUrl || "", true), priceCents:item.priceCents ?? null,
        note:String(item.note || ""), revision:1, status:"open", mine:false };
    })
  };
}
export function encodeSnapshot(list) {
  const bytes = new TextEncoder().encode(JSON.stringify(cleanPublicList(list)));
  const encoded = btoa(Array.from(bytes, value => String.fromCharCode(value)).join(""))
    .replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
  if (encoded.length > 16000) throw new Error("Die lokale Liste ist zu groß für einen Link.");
  return encoded;
}
export function decodeSnapshot(value) {
  if (!value || value.length > 16000 || !/^[\w-]+$/.test(value)) throw new Error("Dieser Listenlink ist ungültig.");
  try {
    const binary = atob(value.replaceAll("-", "+").replaceAll("_", "/"));
    const bytes = Uint8Array.from(binary, char => char.charCodeAt(0));
    return cleanPublicList(JSON.parse(new TextDecoder().decode(bytes)));
  } catch { throw new Error("Dieser Listenlink ist ungültig."); }
}
