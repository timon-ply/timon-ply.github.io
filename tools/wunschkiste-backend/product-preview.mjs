const SHOP_HOSTS = new Set([
  "amazon.de", "www.amazon.de", "amazon.com", "www.amazon.com", "amzn.eu", "amzn.to",
  "lego.com", "www.lego.com", "ikea.com", "www.ikea.com", "otto.de", "www.otto.de", "dm.de", "www.dm.de", "thalia.de", "www.thalia.de",
  "lidl.de", "www.lidl.de", "decathlon.de", "www.decathlon.de", "mediamarkt.de", "www.mediamarkt.de", "saturn.de", "www.saturn.de", "zalando.de", "www.zalando.de"
]);
const SHORT_HOSTS = new Set(["amzn.eu", "amzn.to"]);
const AMAZON_HOSTS = new Set(["amazon.de", "www.amazon.de", "amazon.com", "www.amazon.com"]);
const MAX_BYTES = 1250000;
const MANUAL = "Angaben konnten nicht geladen werden. Bitte selbst ergänzen.";
const IMAGE_HOSTS = {
  amazon: ["media-amazon.com", "ssl-images-amazon.com", "images-amazon.com"],
  lego: ["lego.com", "lego.net"], ikea: ["ikea.com"], otto: ["otto.de", "otto.media"],
  dm: ["dm.de", "dm-static.com"], thalia: ["thalia.de", "buchhandel.de"],
  lidl: ["lidl.de", "lidl.com", "lidlcdn.com"], decathlon: ["decathlon.de", "decathlon.net"],
  mediamarkt: ["mediamarkt.de", "media-markt.com", "media-markt.de", "mmst.eu"],
  saturn: ["saturn.de", "mmst.eu"], zalando: ["zalando.de", "zalando.net"]
};

export function productUrl(value) {
  if (typeof value !== "string" || value.length > 2000) throw new Error("invalid_product_url");
  let url;
  try { url = new URL(value.trim()); } catch { throw new Error("invalid_product_url"); }
  if (url.protocol !== "https:" || url.username || url.password || url.port || !SHOP_HOSTS.has(url.hostname)) {
    throw new Error("unsupported_product_url");
  }
  url.hash = "";
  return url;
}
function empty() { return { title: "", imageUrl: "", priceCents: null, message: MANUAL }; }
function decode(value) {
  const entities = { amp: "&", quot: '"', apos: "'", lt: "<", gt: ">", nbsp: " " };
  return String(value).replace(/&(#x[0-9a-f]{1,6}|#\d{1,7}|amp|quot|apos|lt|gt|nbsp);/gi, (all, entity) => {
    if (entity[0] !== "#") return entities[entity.toLowerCase()] || all;
    const code = entity[1].toLowerCase() === "x" ? parseInt(entity.slice(2), 16) : Number(entity.slice(1));
    return code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff) ? String.fromCodePoint(code) : "";
  });
}
function plain(value, maximum = 90) {
  return typeof value === "string" ? decode(value.slice(0, 2000)).replace(/<[^>]*>/g, "").replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim().slice(0, maximum) : "";
}
function attrs(tag) {
  const data = {};
  const expression = /([\w:-]+)\s*=\s*(?:"([^"]*)"|'([^']*)'|([^\s>]+))/g;
  let match;
  while ((match = expression.exec(tag))) data[match[1].toLowerCase()] = decode(match[2] ?? match[3] ?? match[4]);
  return data;
}
function cents(value) {
  if (typeof value !== "string" && typeof value !== "number") return null;
  let amount = String(value).trim();
  if (/^\d{1,3}(?:\.\d{3})+,\d{2}$/.test(amount)) amount = amount.replace(/\./g, "").replace(",", ".");
  else if (/^\d{1,3}(?:,\d{3})+\.\d{2}$/.test(amount)) amount = amount.replace(/,/g, "");
  else if (/^\d+,\d{1,2}$/.test(amount)) amount = amount.replace(",", ".");
  if (!/^\d+(?:\.\d{1,2})?$/.test(amount)) return null;
  const result = Math.round(Number(amount) * 100);
  return Number.isSafeInteger(result) && result >= 0 && result <= 100000000 ? result : null;
}
function schemaTypes(value) {
  return (Array.isArray(value) ? value : [value]).map(type => typeof type === "string" ? type.replace(/^https?:\/\/schema\.org\//, "") : "");
}
function offerPrice(product) {
  const offers = Array.isArray(product.offers) ? product.offers : [product.offers];
  const prices = new Set();
  if (offers.length > 16) return null;
  for (const offer of offers) {
    if (!offer || typeof offer !== "object") continue;
    const types = schemaTypes(offer["@type"]);
    if (!types.includes("Offer") || types.includes("AggregateOffer")) return null;
    const specification = offer.priceSpecification;
    const currency = offer.priceCurrency || specification?.priceCurrency;
    const price = cents(offer.price ?? specification?.price);
    if (String(currency).toUpperCase() !== "EUR" || price === null) return null;
    prices.add(price);
  }
  return prices.size === 1 ? [...prices][0] : null;
}
function imageUrl(value, page) {
  const source = Array.isArray(value) ? value[0] : value;
  const raw = typeof source === "object" && source ? source.url || source.contentUrl : source;
  if (typeof raw !== "string" || raw.length > 2000) return "";
  let url;
  try { url = new URL(decode(raw), page); } catch { return ""; }
  const shop = AMAZON_HOSTS.has(page.hostname) ? "amazon" : page.hostname.replace(/^www\./, "").split(".")[0];
  const domains = IMAGE_HOSTS[shop] || [];
  if (url.protocol !== "https:" || url.username || url.password || url.port || url.href.length > 2000 ||
      !domains.some(domain => url.hostname === domain || url.hostname.endsWith("." + domain))) return "";
  return url.href;
}
function samePage(value, page) {
  if (typeof value !== "string") return false;
  try { const url = new URL(value, page); return url.origin === page.origin && url.pathname.replace(/\/$/, "") === page.pathname.replace(/\/$/, ""); }
  catch { return false; }
}
function publicElement(html, lower, id, index) {
  // Only a few fixed public product elements are inspected, never executable
  // scripts or page-wide price text. Both opening tag and text are bounded.
  const start = html.lastIndexOf("<", index), end = html.indexOf(">", index);
  if (start < 0 || end < 0 || end - start > 10000 || html.slice(start, index).includes(">")) return null;
  const opening = html.slice(start, end + 1), name = /^<([a-z][a-z0-9]*)\b/i.exec(opening)?.[1]?.toLowerCase();
  if (!name || !["span", "h1", "img"].includes(name)) return null;
  const attributes = attrs(opening);
  if (attributes.id !== id) return null;
  const closing = name === "img" ? end : lower.indexOf("</" + name, end + 1);
  return { attributes, content: closing >= end && closing - end < 4000 ? html.slice(end + 1, closing) : "" };
}
function amazonDetails(html, lower, page) {
  const elements = new Map();
  const pattern = /\bid\s*=\s*["'](productTitle|landingImage|imgBlkFront|apex-pricetopay-accessibility-label|priceblock_ourprice|priceblock_dealprice|priceblock_saleprice)["']/g;
  let found, count = 0;
  while ((found = pattern.exec(html)) && count++ < 32) {
    const element = publicElement(html, lower, found[1], found.index);
    if (element && !elements.has(found[1])) elements.set(found[1], element);
  }
  const title = plain(elements.get("productTitle")?.content);
  const photo = elements.get("landingImage") || elements.get("imgBlkFront");
  const candidates = [photo?.attributes["data-old-hires"], photo?.attributes.src];
  if (photo?.attributes["data-a-dynamic-image"]?.length <= 8000) {
    try {
      const dynamic = JSON.parse(photo.attributes["data-a-dynamic-image"]);
      if (dynamic && typeof dynamic === "object" && !Array.isArray(dynamic)) candidates.push(...Object.keys(dynamic).slice(0, 16));
    } catch { /* An incomplete optional image map cannot block manual entry. */ }
  }
  const prices = new Set();
  for (const id of ["apex-pricetopay-accessibility-label", "priceblock_ourprice", "priceblock_dealprice", "priceblock_saleprice"]) {
    const value = plain(elements.get(id)?.content, 100);
    // Require an explicit EUR symbol/currency and one complete amount. No
    // installment, struck-through, recommended or range prices are inferred.
    const amount = /^(?:EUR\s*)?(\d[\d.,]*)\s*(?:€|EUR)$/.exec(value) || /^EUR\s+(\d[\d.,]*)$/.exec(value);
    const price = amount ? cents(amount[1]) : null;
    if (price !== null) prices.add(price);
  }
  return { title, imageUrl: candidates.map(value => imageUrl(value, page)).find(Boolean) || "", priceCents: prices.size === 1 ? [...prices][0] : null };
}
export function extractProduct(html, page) {
  html = String(html).slice(0, MAX_BYTES);
  const result = empty();
  const lower = html.toLowerCase();
  // A challenge/login document must never supply a misleading product preview.
  const titleStart = lower.indexOf("<title"), titleOpen = titleStart < 0 ? -1 : lower.indexOf(">", titleStart + 6);
  const titleClose = titleOpen < 0 ? -1 : lower.indexOf("</title", titleOpen + 1);
  const titleTag = titleClose > titleOpen && titleClose - titleOpen <= 500 ? html.slice(titleOpen + 1, titleClose) : "";
  if (/captcha|robot check|just a moment|access denied|zugriff verweigert|anmelden|sign[ -]?in|seite wurde nicht gefunden/i.test(titleTag) ||
      /id\s*=\s*["'](?:captchacharacters|challenge-form)["']/i.test(html.slice(0, 100000))) return result;
  const metadata = {};
  let offset = 0;
  for (let tags = 0; tags < 256; tags++) {
    const start = lower.indexOf("<meta", offset);
    if (start < 0) break;
    const end = lower.indexOf(">", start + 5);
    if (end < 0) break;
    offset = end + 1;
    if (!/[\s/>]/.test(lower[start + 5] || "") || end - start > 10000) continue;
    const tag = html.slice(start, end + 1);
    const attributes = attrs(tag), key = (attributes.property || attributes.name || "").toLowerCase();
    if (key && !(key in metadata)) metadata[key] = attributes.content || "";
  }
  const products = [];
  let blocks = 0, nodes = 0;
  function visit(value, depth = 0) {
    if (!value || typeof value !== "object" || depth > 8 || ++nodes > 128) return;
    if (Array.isArray(value)) { for (const entry of value.slice(0, 32)) visit(entry, depth + 1); return; }
    const types = schemaTypes(value["@type"]);
    if (types.includes("Product")) products.push(value);
    if (value["@graph"]) visit(value["@graph"], depth + 1);
    if (value.mainEntity) visit(value.mainEntity, depth + 1);
  }
  offset = 0;
  for (let scripts = 0; scripts < 128 && blocks < 8; scripts++) {
    const start = lower.indexOf("<script", offset);
    if (start < 0) break;
    const opening = lower.indexOf(">", start + 7);
    if (opening < 0) break;
    const closing = lower.indexOf("</script", opening + 1);
    if (closing < 0) break;
    const end = lower.indexOf(">", closing + 8);
    if (end < 0) break;
    offset = end + 1;
    if (!/[\s/>]/.test(lower[start + 7] || "") || opening - start > 2000 ||
        (attrs(html.slice(start, opening + 1)).type || "").toLowerCase() !== "application/ld+json") continue;
    blocks++;
    if (closing - opening - 1 > 128000) continue;
    try { visit(JSON.parse(html.slice(opening + 1, closing))); } catch { /* Incomplete or invalid public metadata is optional. */ }
  }
  const matching = products.filter(product => samePage(product.url || product["@id"], page));
  const product = matching.length === 1 ? matching[0] : products.length === 1 ? products[0] : null;
  if (products.length > 1 && !product) return result;
  const amazonProduct = AMAZON_HOSTS.has(page.hostname) && /\/(?:dp|gp\/product)\/[A-Z0-9]{10}(?:\/|$)/i.test(page.pathname);
  const amazon = amazonProduct ? amazonDetails(html, lower, page) : null;
  // A /dp/ URL may return a generic 200 error page with Amazon's social title
  // and logo. URL shape alone is not evidence that a product was delivered.
  const productPage = Boolean(product) || metadata["og:type"]?.toLowerCase() === "product" ||
    (!AMAZON_HOSTS.has(page.hostname) && metadata["twitter:card"]?.toLowerCase() === "product") || Boolean(amazon?.title);
  if (!productPage) return result;
  result.title = [product?.name, metadata["og:title"], metadata["twitter:title"], amazon?.title].map(value => plain(value)).find(Boolean) || "";
  result.imageUrl = [product?.image, metadata["og:image:secure_url"], metadata["og:image"], metadata["twitter:image"], metadata["twitter:image:src"], amazon?.imageUrl].map(value => imageUrl(value, page)).find(Boolean) || "";
  result.priceCents = product ? offerPrice(product) : null;
  // A range/ambiguous Product offer must not be replaced by a single display price.
  if (!product?.offers && metadata["product:price:currency"]?.toUpperCase() === "EUR") {
    result.priceCents = cents(metadata["product:price:amount"]);
  }
  if (!product?.offers && result.priceCents === null && amazon) result.priceCents = amazon.priceCents;
  if (!result.title && !result.imageUrl && result.priceCents === null) return empty();
  result.message = result.title && result.imageUrl && result.priceCents !== null ? "" : "Bitte fehlende Angaben ergänzen.";
  return result;
}
async function limitedHtml(response) {
  const reader = response.body?.getReader();
  if (!reader) return "";
  const decoder = new TextDecoder(), parts = [];
  let size = 0;
  try {
    while (size < MAX_BYTES) {
      const part = await reader.read();
      if (part.done) break;
      const available = Math.min(part.value.byteLength, MAX_BYTES - size);
      parts.push(decoder.decode(part.value.subarray(0, available), { stream: true }));
      size += available;
    }
    parts.push(decoder.decode());
  } finally { await reader.cancel(); }
  return parts.join("");
}
export async function previewProduct(url) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), 8000);
  const shortLink = SHORT_HOSTS.has(url.hostname);
  try {
    for (let redirects = 0; redirects <= 3; redirects++) {
      const response = await fetch(url.href, {
        method: "GET", redirect: "manual", signal: controller.signal, credentials: "omit",
        headers: { "User-Agent": "Wunschkiste/1.0 (+https://timonply.com/appidee/)", Accept: "text/html, application/xhtml+xml" }
      });
      if ([301, 302, 303, 307, 308].includes(response.status)) {
        const location = response.headers.get("location");
        await response.body?.cancel();
        if (!location || redirects === 3) return empty();
        url = productUrl(new URL(location, url).href);
        if (shortLink && !SHORT_HOSTS.has(url.hostname) && !AMAZON_HOSTS.has(url.hostname)) return empty();
        continue;
      }
      if (!response.ok || !/^(?:text\/html|application\/xhtml\+xml)(?:;|$)/i.test(response.headers.get("content-type") || "") ||
          SHORT_HOSTS.has(url.hostname)) { await response.body?.cancel(); return empty(); }
      return extractProduct(await limitedHtml(response), url);
    }
  } catch { return empty(); }
  finally { clearTimeout(timer); }
  return empty();
}
