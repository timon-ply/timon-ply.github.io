(() => {
  "use strict";

  const app = document.getElementById("app");
  const createDialog = document.getElementById("create-dialog");
  const wishDialog = document.getElementById("wish-dialog");
  const shareDialog = document.getElementById("share-dialog");
  const confirmDialog = document.getElementById("confirm-dialog");
  const toast = document.getElementById("toast");
  const LISTS_KEY = "wunschkiste.v1.lists";
  const PICKS_KEY = "wunschkiste.v1.picks";
  let activeListId = null;
  let toastTimer = null;
  let pendingConfirm = null;

  const sampleDate = (() => {
    const date = new Date();
    date.setDate(date.getDate() + 12);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
  })();

  const sampleList = {
    id: "beispiel",
    title: "Mias 7. Geburtstag",
    date: sampleDate,
    message: "Ich freue mich auf einen bunten Nachmittag mit euch!",
    isSample: true,
    items: [
      { id: "sample-tiles", title: "Magnetbausteine – Creative Set", price: 49.99, note: "Bunte Farben zum Immer-wieder-Bauen.", kind: "tiles" },
      { id: "sample-train", title: "Holzeisenbahn – Klassiker", price: 39.95, note: "Ein Zug mit ein paar bunten Waggons.", kind: "train" },
      { id: "sample-pencils", title: "Aquarellstifte, 24 Farben", price: 22.99, note: "Für die nächsten großen Kunstwerke.", kind: "pencils" },
      { id: "sample-book", title: "Bilderbuch: Der wunderbare Baum", price: 18, note: "Eine Geschichte über Freundschaft und Mut.", kind: "book", sampleClaimed: true },
      { id: "sample-idea", title: "Ein gemeinsamer Kinobesuch", price: null, note: "Zusammen Popcorn teilen.", kind: "idea", sampleClaimed: true }
    ]
  };

  const iconLock = '<svg viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10" width="14" height="11" rx="2" fill="none" stroke="currentColor" stroke-width="1.7"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';

  function escapeHtml(value) {
    return String(value ?? "").replace(/[&<>"']/g, (char) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
  }

  function readArray(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "[]");
      return Array.isArray(value) ? value : [];
    } catch {
      return [];
    }
  }

  function readObject(key) {
    try {
      const value = JSON.parse(localStorage.getItem(key) || "{}");
      return value && typeof value === "object" && !Array.isArray(value) ? value : {};
    } catch {
      return {};
    }
  }

  function writeJson(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch {
      showToast("Speichern ging gerade nicht. Prüfe bitte den freien Speicher in diesem Browser.");
      return false;
    }
  }

  function lists() { return readArray(LISTS_KEY); }
  function picks() { return readObject(PICKS_KEY); }
  function saveLists(value) { return writeJson(LISTS_KEY, value); }
  function savePicks(value) { return writeJson(PICKS_KEY, value); }
  function getList(id) { return lists().find((list) => list.id === id) || null; }
  function pickKey(listId, itemId) { return `${listId}:${itemId}`; }

  function makeId() {
    if (window.crypto?.randomUUID) return window.crypto.randomUUID().replaceAll("-", "").slice(0, 20);
    return `${Date.now().toString(36)}${Math.random().toString(36).slice(2, 10)}`;
  }

  function currentUrl() {
    const url = new URL(window.location.href);
    url.search = "";
    url.hash = "";
    return url;
  }

  function navigate(params = {}) {
    const url = currentUrl();
    Object.entries(params).forEach(([key, value]) => {
      if (value === null || value === undefined || value === "") url.searchParams.delete(key);
      else url.searchParams.set(key, value);
    });
    window.history.pushState({}, "", url);
    closeMenu();
    render();
    window.scrollTo({ top: 0, behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "instant" : "smooth" });
  }

  function showToast(message) {
    toast.textContent = message;
    toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => toast.classList.remove("is-visible"), 3200);
  }

  function openDialog(dialog, focusId) {
    if (!dialog.open) dialog.showModal();
    if (focusId) requestAnimationFrame(() => document.getElementById(focusId)?.focus());
  }

  function closeMenu() {
    document.querySelector(".topnav")?.classList.remove("is-open");
    document.querySelector(".menu-toggle")?.setAttribute("aria-expanded", "false");
  }

  function formatPrice(price) {
    if (price === null || price === undefined || price === "" || Number.isNaN(Number(price))) return "";
    return new Intl.NumberFormat("de-DE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(Number(price));
  }

  function dateLabel(value) {
    if (!value) return "";
    const [year, month, day] = value.split("-").map(Number);
    if (!year || !month || !day) return "";
    const date = new Date(year, month - 1, day);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const delta = Math.round((date.getTime() - today.getTime()) / 86400000);
    const formatted = new Intl.DateTimeFormat("de-DE", { day: "numeric", month: "long" }).format(date);
    if (delta === 0) return `${formatted} · heute wird gefeiert`;
    if (delta === 1) return `${formatted} · noch 1 Tag`;
    if (delta > 1) return `${formatted} · noch ${delta} Tage`;
    return formatted;
  }

  function safeShopUrl(value) {
    if (!value) return null;
    try {
      const url = new URL(value);
      return url.protocol === "https:" || url.protocol === "http:" ? url.href : null;
    } catch {
      return null;
    }
  }

  function shopHost(value) {
    const safe = safeShopUrl(value);
    if (!safe) return "";
    try { return new URL(safe).hostname.replace(/^www\./, ""); } catch { return ""; }
  }

  function previewDisclosure() {
    return `<aside class="demo-ribbon" aria-label="Hinweis zur Vorschau"><span class="demo-icon" aria-hidden="true">i</span><span><strong>Web-Vorschau:</strong> Nur in diesem Browser gespeichert. Keine Synchronisierung zwischen Geräten.</span></aside>`;
  }

  function itemCounts(list) {
    const itemList = list.items || [];
    let claimed = 0;
    itemList.forEach((item) => {
      if (item.sampleClaimed || item.claimed || picks()[pickKey(list.id, item.id)]) claimed += 1;
    });
    return { total: itemList.length, claimed, open: itemList.length - claimed };
  }

  function renderHome() {
    return `
      <section class="hero" aria-labelledby="hero-title">
        <div class="hero-copy">
          <p class="eyebrow">DIE DIGITALE GESCHENKEBOX FÜR DEN KINDERGEBURTSTAG</p>
          <h1 id="hero-title">Kleine Wünsche.<em>Große Vorfreude.</em></h1>
          <p class="hero-lede">Sammle Geburtstagswünsche in einer Kiste. Teile den Link. Deine Gäste suchen sich anonym ein Geschenk aus.</p>
          <div class="hero-actions">
            <button class="button button-primary" type="button" data-action="open-create">Wunschkiste erstellen <span aria-hidden="true">→</span></button>
            <button class="button button-outline" type="button" data-action="example">Beispiel ansehen</button>
          </div>
          <p class="hero-note"><span class="leaf" aria-hidden="true">✳</span> Für Gäste ohne App und ohne Konto.</p>
        </div>
        <div class="hero-art" aria-label="Illustration einer geöffneten Wunschkiste">
          <span class="hero-tag">Etwas Schönes<br>wartet schon …</span>
          <img class="hero-box" src="assets/wunschkiste-box.webp" alt="Eine offene Geschenkbox mit grüner Schleife und Papiersternen" width="1280" height="1280">
          <div class="hero-mini-card" aria-hidden="true">
            <div class="hero-mini-top"><span>Gästeliste</span><span>✳</span></div>
            <div class="hero-mini-title">Mias Geburtstag</div>
            <div class="hero-mini-item"><span>✦</span><span>Magnetbausteine</span></div>
            <div class="hero-mini-item is-taken"><span>✓</span><span>Ein Bilderbuch</span></div>
            <div class="hero-mini-line"></div>
            <div class="hero-mini-foot">Noch 3 Wünsche offen</div>
          </div>
        </div>
      </section>
      ${previewDisclosure()}
      <section class="how-section" id="so-gehts" aria-labelledby="how-title">
        <div class="section-inner">
          <div class="section-heading">
            <p class="eyebrow">DREI KLEINE SCHRITTE</p>
            <h2 id="how-title">Ein Wunschzettel, der mitdenkt.</h2>
            <p>Weniger Suchen und doppelte Geschenke. Mehr Zeit für den Geburtstag.</p>
          </div>
          <div class="steps">
            <article class="step"><span class="step-number" aria-hidden="true">1</span><h3>Wünsche sammeln</h3><p>Produkte verlinken oder eigene Ideen eintragen – ganz ohne Shop-Vorgabe.</p></article>
            <article class="step"><span class="step-number" aria-hidden="true">2</span><h3>Einmal teilen</h3><p>Ein Gästelink reicht. Deine Gäste brauchen dafür weder Konto noch App.</p></article>
            <article class="step"><span class="step-number" aria-hidden="true">3</span><h3>Freude verschenken</h3><p>Ein Wunsch wird vorgemerkt und für andere als vergeben angezeigt – ohne Namen.</p></article>
          </div>
        </div>
      </section>
      <section class="sample-section" aria-labelledby="sample-title">
        <div class="section-inner">
          <div class="sample-head">
            <div><p class="eyebrow">SO KANN EINE KISTE AUSSEHEN</p><h2 id="sample-title">Schon eine Idee im Kopf?</h2><p>Probier die Auswahl einmal selbst aus – ganz ohne Anmeldung.</p></div>
            <button class="button button-primary" type="button" data-action="example">Beispiel öffnen <span aria-hidden="true">→</span></button>
          </div>
          <div class="sample-preview">
            <div class="sample-preview-top"><div><h3>Mias 7. Geburtstag</h3><p>Ein paar Wünsche, die das Schenken leichter machen.</p></div><span class="open-count"><span aria-hidden="true">✳</span> 3 noch offen</span></div>
            <div class="preview-items">
              <div class="preview-item"><div class="preview-item-title"><span class="preview-icon" aria-hidden="true">✦</span> Magnetbausteine</div><p>Ein buntes Set für viele Bauideen</p></div>
              <div class="preview-item"><div class="preview-item-title"><span class="preview-icon" aria-hidden="true">✦</span> Holzeisenbahn</div><p>Ein Klassiker für die Spielzeugkiste</p></div>
              <div class="preview-item"><div class="preview-item-title"><span class="preview-icon" aria-hidden="true">✓</span> Bilderbuch</div><p>Schon ausgesucht – bleibt eine Überraschung</p></div>
            </div>
          </div>
        </div>
      </section>`;
  }

  function renderMyLists() {
    const all = lists();
    const cards = all.length ? `<div class="my-list-grid">${all.map((list) => {
      const counts = itemCounts(list);
      return `<article class="my-list-card"><div><h2>${escapeHtml(list.title)}</h2><p>${counts.total} ${counts.total === 1 ? "Wunsch" : "Wünsche"}${list.date ? ` · ${escapeHtml(dateLabel(list.date))}` : ""}</p></div><a class="button button-small button-outline" href="${escapeHtml(ownerHref(list))}">Öffnen <span aria-hidden="true">→</span></a></article>`;
    }).join("")}</div>` : `<div class="empty-state"><img class="empty-state-art" src="assets/wunschkiste-box.webp" alt="" width="1280" height="1280"><h2>Noch ist die Kiste leer.</h2><p>Lege deine erste Wunschkiste an und sammle die Geschenkideen an einem Ort.</p><button class="button button-primary" type="button" data-action="open-create">Wunschkiste erstellen <span aria-hidden="true">→</span></button></div>`;
    return `<section class="content-wrap" aria-labelledby="mine-title"><div class="manager-header my-lists-heading"><p class="eyebrow">DEINE ÜBERSICHT</p><div class="header-row"><div><h1 id="mine-title">Meine Kisten</h1><p class="subline">Deine Wunschkisten werden lokal in diesem Browser aufbewahrt.</p></div><div class="header-actions"><button class="button button-primary" type="button" data-action="open-create">Neue Kiste <span aria-hidden="true">+</span></button></div></div></div>${previewDisclosure()}${cards}</section>`;
  }

  function cardArtwork(item) {
    if (item.kind === "idea") return `<div class="wish-art" data-kind="idea" aria-hidden="true"><span class="idea-art-mark">✳</span></div>`;
    return `<div class="wish-art" data-kind="${escapeHtml(item.kind || "tiles")}" role="img" aria-label="${escapeHtml(item.title)}"></div>`;
  }

  function renderWishCard(list, item, owner) {
    const selectedState = picks()[pickKey(list.id, item.id)];
    const isClaimed = Boolean(item.sampleClaimed || item.claimed || selectedState);
    const mine = Boolean(selectedState);
    const bought = selectedState === "bought";
    const price = formatPrice(item.price);
    const safeUrl = safeShopUrl(item.url);
    const host = shopHost(item.url);
    let action = "";
    if (owner) {
      action = isClaimed
        ? `<span class="status-button"><span class="status-check" aria-hidden="true">✓</span> Schon ausgesucht</span><button type="button" class="button-text" data-action="release-owner" data-item="${escapeHtml(item.id)}">Wunsch wieder freigeben</button>`
        : `<span class="status-button"><span class="status-check" aria-hidden="true">·</span> Noch offen</span>`;
    } else if (mine) {
      action = `<span class="status-button is-owned"><span class="status-check" aria-hidden="true">✓</span>${bought ? "Schon besorgt" : "Für dich vorgemerkt"}</span>${safeUrl ? `<a class="shop-button" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">Zum Shop <span aria-hidden="true">↗</span></a>` : ""}<button type="button" class="button-text" data-action="release" data-item="${escapeHtml(item.id)}">Auswahl freigeben</button>${!bought ? `<button type="button" class="button-text" data-action="mark-bought" data-item="${escapeHtml(item.id)}">Als gekauft markieren</button>` : ""}`;
    } else if (isClaimed) {
      action = `<span class="status-button" aria-label="Schon ausgesucht"><span class="status-check" aria-hidden="true">✓</span> Schon ausgesucht</span>`;
    } else {
      action = `<button class="button button-primary wish-action" type="button" data-action="claim" data-item="${escapeHtml(item.id)}"><span class="gift-symbol" aria-hidden="true">✳</span> Das schenke ich</button>`;
    }
    const priceHtml = price ? `<span class="price">ca. ${escapeHtml(price)}</span>` : "";
    const noteHtml = item.note ? `<p class="wish-note">${escapeHtml(item.note)}</p>` : `<p class="wish-note"></p>`;
    const metaLinkHtml = safeUrl
      ? `<a class="shop-link" href="${escapeHtml(safeUrl)}" target="_blank" rel="noopener noreferrer">${escapeHtml(host)} <span aria-hidden="true">↗</span></a>`
      : `<span>${item.kind === "idea" ? "Eine eigene Idee" : "Mit Liebe ausgesucht"}</span>`;
    const ownerToolsHtml = owner
      ? `<div class="wish-card-actions">${action}<div class="owner-actions"><button type="button" data-action="edit-wish" data-item="${escapeHtml(item.id)}">Bearbeiten</button><button class="destructive-link" type="button" data-action="delete-wish" data-item="${escapeHtml(item.id)}">Entfernen</button></div></div>`
      : "";
    const guestActionHtml = owner ? "" : `<div class="wish-card-actions">${action}</div>`;
    const cardBodyHtml = `<div class="wish-card-body"><div class="wish-card-heading"><h3>${escapeHtml(item.title)}</h3>${priceHtml}</div>${noteHtml}<div class="wish-card-meta">${metaLinkHtml}<span>${isClaimed ? "für andere nicht verfügbar" : ""}</span></div>${guestActionHtml}</div>`;
    return `<article class="wish-card${isClaimed ? " is-claimed" : ""}" data-card="${escapeHtml(item.id)}">${cardArtwork(item)}${cardBodyHtml}${ownerToolsHtml}</article>`;
  }

  function ownerHref(list) {
    const url = currentUrl();
    url.searchParams.set("kiste", list.id);
    url.searchParams.set("verwalten", list.ownerToken);
    return url.toString();
  }

  function guestHref(list) {
    const url = currentUrl();
    url.searchParams.set("kiste", list.id);
    url.searchParams.delete("verwalten");
    url.searchParams.delete("meine");
    return url.toString();
  }

  function renderOwner(list) {
    const counts = itemCounts(list);
    const cards = list.items.length ? `<div class="wish-grid">${list.items.map((item) => renderWishCard(list, item, true)).join("")}</div>` : `<div class="empty-state"><img class="empty-state-art" src="assets/wunschkiste-box.webp" alt="" width="1280" height="1280"><h2>Der erste Wunsch macht den Anfang.</h2><p>Füge ein Produkt oder eine eigene Idee hinzu. Danach kannst du den Gästelink mit der Einladung teilen.</p><button class="button button-primary" type="button" data-action="open-wish">Wunsch hinzufügen <span aria-hidden="true">+</span></button></div>`;
    return `<section class="content-wrap" aria-labelledby="owner-title"><div class="manager-header"><p class="eyebrow">DEIN VERWALTUNGSBEREICH · NUR AUF DIESEM BROWSER</p><div class="header-row"><div><h1 id="owner-title">${escapeHtml(list.title)}</h1><p class="subline">Hier fügst du Wünsche hinzu und teilst den Gästelink. Namen von Schenkenden werden nicht gespeichert.</p></div><div class="header-actions"><button class="button button-primary" type="button" data-action="share">Link teilen <span aria-hidden="true">↗</span></button></div></div>${list.message ? `<p class="list-welcome">“${escapeHtml(list.message)}”</p>` : ""}<div class="list-status-row"><span>${counts.total ? `${counts.claimed} von ${counts.total} Wünschen schon ausgesucht` : "Noch keine Wünsche hinzugefügt"}</span>${counts.total ? `<span class="progress-track" aria-label="${counts.claimed} von ${counts.total} Wünschen ausgesucht"><span class="progress-fill" style="width:${Math.round(counts.claimed / counts.total * 100)}%"></span></span>` : ""}${list.date ? `<span>${escapeHtml(dateLabel(list.date))}</span>` : ""}</div></div>${previewDisclosure()}<div class="wishlist-section"><div class="wishlist-section-title"><h2>Die Wünsche</h2><span>${counts.total} ${counts.total === 1 ? "Eintrag" : "Einträge"}</span></div>${cards}</div><div class="wishlist-section"><button class="button button-outline" type="button" data-action="open-wish">+ Wunsch hinzufügen</button> <button class="button-text" type="button" data-action="edit-list">Kistentitel und Gruß bearbeiten</button> <button class="button-text" type="button" data-action="delete-list">Kiste auf diesem Browser löschen</button></div></section>`;
  }

  function renderGuest(list) {
    const counts = itemCounts(list);
    const openItems = list.items.filter((item) => !(item.sampleClaimed || item.claimed || picks()[pickKey(list.id, item.id)]));
    const claimedItems = list.items.filter((item) => item.sampleClaimed || item.claimed || picks()[pickKey(list.id, item.id)]);
    const selectedItems = list.items.filter((item) => Boolean(picks()[pickKey(list.id, item.id)]));
    const openCards = openItems.length ? `<div class="wish-grid">${openItems.map((item) => renderWishCard(list, item, false)).join("")}</div>` : `<div class="empty-state"><h2>Alle Wünsche sind schon ausgesucht.</h2><p>Danke, dass du beim Schenken hilfst. Die Überraschung wartet schon.</p></div>`;
    const claimedBlock = claimedItems.length ? `<details class="other-wishes"><summary>Auch schon ausgesuchte Wünsche zeigen <span>${claimedItems.length}</span></summary><div class="wish-grid">${claimedItems.map((item) => renderWishCard(list, item, false)).join("")}</div></details>` : "";
    const selectedBlock = selectedItems.length ? `<section class="selection-section" aria-labelledby="selection-title"><h2 id="selection-title">Deine Auswahl</h2><p>Diese Wünsche sind für dich vorgemerkt. Dein Name wird niemandem angezeigt.</p><div class="selection-chips">${selectedItems.map((item) => `<span class="selection-chip">${escapeHtml(item.title)} <button type="button" aria-label="Auswahl für ${escapeHtml(item.title)} freigeben" data-action="release" data-item="${escapeHtml(item.id)}">×</button></span>`).join("")}</div></section>` : "";
    return `<section class="content-wrap" aria-labelledby="guest-title"><div class="list-heading"><p class="eyebrow">EINE WUNSCHKISTE FÜR DICH</p><div class="header-row"><div><h1 id="guest-title">${escapeHtml(list.title)}</h1><p class="subline">Such dir einen Wunsch aus – und mach den Geburtstag ein bisschen schöner.</p>${list.date ? `<p class="subline">${escapeHtml(dateLabel(list.date))}</p>` : ""}</div></div>${list.message ? `<p class="list-welcome">“${escapeHtml(list.message)}”</p>` : ""}<div class="list-status-row"><span>${counts.open} ${counts.open === 1 ? "Wunsch noch offen" : "Wünsche noch offen"}</span><span class="progress-track" aria-label="${counts.claimed} von ${counts.total} Wünschen schon ausgesucht"><span class="progress-fill" style="width:${counts.total ? Math.round(counts.claimed / counts.total * 100) : 0}%"></span></span><span>${counts.claimed} schon ausgesucht</span></div><p class="privacy-line"><span class="privacy-lock">${iconLock}</span><span>Die Auswahl bleibt für andere Gäste anonym.</span></p></div>${previewDisclosure()}${selectedBlock}<div class="wishlist-section"><div class="wishlist-section-title"><h2>Such dir einen Wunsch aus</h2><span>${counts.total} ${counts.total === 1 ? "Wunsch" : "Wünsche"} in der Kiste</span></div>${openCards}${claimedBlock}</div></section>`;
  }

  function renderNotFound() {
    return `<section class="not-found"><p class="eyebrow">DIE KISTE IST HIER NICHT GESPEICHERT</p><h1>Dieser Link kennt den Wunsch noch nicht.</h1><p>In dieser Vorschau liegen selbst erstellte Kisten nur im Browser, in dem sie angelegt wurden. Bitte öffne den Verwaltungslink auf diesem Gerät oder schau dir unser Beispiel an.</p><button class="button button-primary" type="button" data-action="example">Beispiel ansehen <span aria-hidden="true">→</span></button></section>`;
  }

  function isOwnerRoute(list) {
    const token = new URLSearchParams(window.location.search).get("verwalten");
    return Boolean(token && list.ownerToken && token === list.ownerToken);
  }

  function render() {
    const params = new URLSearchParams(window.location.search);
    const listId = params.get("kiste");
    activeListId = listId;
    let content;
    if (params.get("meine") === "1") {
      content = renderMyLists();
      document.title = "Meine Kisten · Wunschkiste";
    } else if (listId === "beispiel") {
      content = renderGuest(sampleList);
      document.title = `${sampleList.title} · Wunschkiste`;
    } else if (listId) {
      const list = getList(listId);
      content = list ? (isOwnerRoute(list) ? renderOwner(list) : renderGuest(list)) : renderNotFound();
      document.title = `${list ? list.title : "Wunschkiste"} · Wunschkiste`;
    } else {
      content = renderHome();
      document.title = "Wunschkiste — Kleine Wünsche. Große Vorfreude.";
    }
    app.innerHTML = content;
    app.setAttribute("aria-busy", "false");
    updateNav();
  }

  function updateNav() {
    const params = new URLSearchParams(window.location.search);
    document.querySelector('[data-nav="mine"]')?.setAttribute("aria-current", params.get("meine") === "1" ? "page" : "false");
    document.querySelector('[data-nav="how"]')?.setAttribute("aria-current", !params.get("kiste") && params.get("meine") !== "1" ? "location" : "false");
  }

  function showError(id, text, show) {
    const node = document.getElementById(id);
    if (!node) return;
    if (text) node.textContent = text;
    node.hidden = !show;
  }

  function closeErrorOnInput(inputId, errorId) {
    document.getElementById(inputId)?.addEventListener("input", () => showError(errorId, "", false));
  }

  closeErrorOnInput("list-title", "list-title-error");
  closeErrorOnInput("wish-name", "wish-name-error");
  closeErrorOnInput("wish-url", "wish-url-error");

  document.getElementById("create-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    if (title.length < 3) {
      showError("list-title-error", "Gib deiner Wunschkiste einen Namen (mindestens 3 Zeichen).", true);
      document.getElementById("list-title").focus();
      return;
    }
    const editingId = form.dataset.editing || "";
    if (editingId) {
      const all = lists();
      const existing = all.find((entry) => entry.id === editingId);
      if (!existing || !isOwnerRoute(existing)) {
        showToast("Diese Wunschkiste lässt sich hier gerade nicht bearbeiten.");
        return;
      }
      existing.title = title.slice(0, 80);
      existing.date = String(data.get("date") || "");
      existing.message = String(data.get("message") || "").trim().slice(0, 180);
      if (!saveLists(all)) return;
      delete form.dataset.editing;
      createDialog.close();
      render();
      showToast("Deine Kiste wurde aktualisiert.");
      return;
    }
    const list = {
      id: makeId(),
      ownerToken: makeId(),
      title: title.slice(0, 80),
      date: String(data.get("date") || ""),
      message: String(data.get("message") || "").trim().slice(0, 180),
      items: [],
      createdAt: new Date().toISOString()
    };
    const all = lists();
    all.unshift(list);
    if (!saveLists(all)) return;
    createDialog.close();
    form.reset();
    closeMenu();
    const url = currentUrl();
    url.searchParams.set("kiste", list.id);
    url.searchParams.set("verwalten", list.ownerToken);
    window.history.pushState({}, "", url);
    render();
    showToast("Deine Kiste ist angelegt. Füge jetzt den ersten Wunsch hinzu.");
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("wish-form").addEventListener("submit", (event) => {
    event.preventDefault();
    const list = getList(activeListId);
    if (!list || !isOwnerRoute(list)) {
      wishDialog.close();
      showToast("Diese Kiste lässt sich hier gerade nicht bearbeiten.");
      return;
    }
    const form = event.currentTarget;
    const data = new FormData(form);
    const title = String(data.get("title") || "").trim();
    if (!title) {
      showError("wish-name-error", "Wie heißt der Wunsch?", true);
      document.getElementById("wish-name").focus();
      return;
    }
    const rawUrl = String(data.get("url") || "").trim();
    if (rawUrl && !safeShopUrl(rawUrl)) {
      showError("wish-url-error", "Bitte einen gültigen http- oder https-Link eintragen.", true);
      document.getElementById("wish-url").focus();
      return;
    }
    const priceInput = String(data.get("price") || "").trim();
    const validPriceFormat = /^\d{1,4}(?:[,.]\d{1,2})?$/.test(priceInput);
    const priceValue = priceInput.replace(",", ".");
    const price = priceInput === "" ? null : Number(priceValue);
    if (priceInput !== "" && (!validPriceFormat || !Number.isFinite(price) || price < 0 || price > 9999)) {
      showToast("Bitte trage einen Preis zwischen 0 und 9.999 € ein.");
      document.getElementById("wish-price").focus();
      return;
    }
    const editingId = form.dataset.editing || "";
    const item = { id: editingId || makeId(), title: title.slice(0, 90), url: safeShopUrl(rawUrl) || "", price, kind: String(data.get("kind") || "idea"), note: String(data.get("note") || "").trim().slice(0, 140), claimed: false };
    const all = lists();
    const target = all.find((entry) => entry.id === list.id);
    if (!target) return;
    if (editingId) {
      const index = target.items.findIndex((entry) => entry.id === editingId);
      if (index === -1) return;
      item.claimed = Boolean(target.items[index].claimed);
      target.items[index] = item;
    } else {
      target.items.push(item);
    }
    if (!saveLists(all)) return;
    wishDialog.close();
    form.reset();
    delete form.dataset.editing;
    render();
    showToast(editingId ? "Der Wunsch wurde aktualisiert." : "Der Wunsch ist in der Kiste.");
  });

  document.getElementById("confirm-accept").addEventListener("click", () => {
    confirmDialog.close();
    if (typeof pendingConfirm === "function") pendingConfirm();
    pendingConfirm = null;
  });

  document.addEventListener("click", async (event) => {
    const actionButton = event.target.closest("[data-action]");
    if (!actionButton) return;
    const action = actionButton.dataset.action;

    if (action === "open-create") {
      closeMenu();
      showError("list-title-error", "", false);
      openDialog(createDialog, "list-title");
    } else if (action === "example") {
      navigate({ kiste: "beispiel", verwalten: null, meine: null });
    } else if (action === "toggle-menu") {
      const menu = document.querySelector(".topnav");
      const open = menu?.classList.toggle("is-open") || false;
      actionButton.setAttribute("aria-expanded", String(open));
    } else if (action === "close-dialog") {
      actionButton.closest("dialog")?.close();
    } else if (action === "cancel-confirm") {
      pendingConfirm = null;
      confirmDialog.close();
    } else if (action === "open-wish") {
      if (!getList(activeListId)) { showToast("Öffne zuerst deine Wunschkiste."); return; }
      const form = document.getElementById("wish-form");
      form.reset();
      delete form.dataset.editing;
      document.getElementById("wish-title").textContent = "Was wünscht sich das Geburtstagskind?";
      showError("wish-name-error", "", false);
      showError("wish-url-error", "", false);
      openDialog(wishDialog, "wish-name");
    } else if (action === "share") {
      const list = getList(activeListId);
      if (!list || !isOwnerRoute(list)) return;
      document.getElementById("guest-link").value = guestHref(list);
      document.getElementById("owner-link").value = ownerHref(list);
      openDialog(shareDialog, "guest-link");
    } else if (action === "share-list") {
      const list = activeListId === "beispiel" ? sampleList : getList(activeListId);
      const url = guestHref(list);
      try {
        if (navigator.share) {
          await navigator.share({ title: list.title, text: `Schau dir die Wunschkiste „${list.title}“ an.`, url });
        } else {
          await navigator.clipboard.writeText(url);
          showToast("Der Gästelink wurde kopiert.");
        }
      } catch {
        if (navigator.clipboard) showToast("Der Gästelink konnte nicht geteilt werden. Du kannst ihn aus der Adresszeile kopieren.");
      }
    } else if (action === "copy") {
      const input = document.getElementById(actionButton.dataset.copy);
      if (!input) return;
      try {
        await navigator.clipboard.writeText(input.value);
        showToast(actionButton.dataset.copy === "owner-link" ? "Verwaltungslink kopiert – bitte für dich behalten." : "Gästelink kopiert. Du kannst ihn in eine Einladung einfügen.");
      } catch {
        input.focus();
        input.select();
        try { document.execCommand("copy"); } catch { /* The selected URL remains available for manual copying. */ }
        showToast("Link markiert. Kopiere ihn mit Strg+C oder ⌘C.");
      }
    } else if (action === "edit-list") {
      const list = getList(activeListId);
      if (!list || !isOwnerRoute(list)) return;
      document.getElementById("list-title").value = list.title;
      document.getElementById("list-date").value = list.date || "";
      document.getElementById("list-message").value = list.message || "";
      document.getElementById("create-title").textContent = "Deine Kiste bearbeiten";
      document.querySelector("#create-form .button-primary").innerHTML = "Änderungen speichern <span aria-hidden=\"true\">→</span>";
      document.getElementById("create-form").dataset.editing = list.id;
      openDialog(createDialog, "list-title");
    } else if (action === "edit-wish") {
      const list = getList(activeListId);
      const item = list?.items.find((entry) => entry.id === actionButton.dataset.item);
      if (!list || !isOwnerRoute(list) || !item) return;
      const form = document.getElementById("wish-form");
      form.dataset.editing = item.id;
      form.elements.title.value = item.title;
      form.elements.url.value = item.url || "";
      form.elements.price.value = item.price ?? "";
      form.elements.kind.value = item.kind || "idea";
      form.elements.note.value = item.note || "";
      document.getElementById("wish-title").textContent = "Wunsch bearbeiten";
      document.querySelector("#wish-form .button-primary").innerHTML = "Änderungen speichern <span aria-hidden=\"true\">→</span>";
      showError("wish-name-error", "", false);
      showError("wish-url-error", "", false);
      openDialog(wishDialog, "wish-name");
    } else if (action === "delete-wish") {
      const list = getList(activeListId);
      if (!list || !isOwnerRoute(list)) return;
      const itemId = actionButton.dataset.item;
      const item = list.items.find((entry) => entry.id === itemId);
      document.getElementById("confirm-title").textContent = "Diesen Wunsch entfernen?";
      document.getElementById("confirm-copy").textContent = `„${item?.title || "Der Wunsch"}“ wird aus der Kiste entfernt.`;
      document.getElementById("confirm-accept").textContent = "Wunsch entfernen";
      pendingConfirm = () => {
        const all = lists();
        const target = all.find((entry) => entry.id === list.id);
        if (!target) return;
        target.items = target.items.filter((entry) => entry.id !== itemId);
        const allPicks = picks();
        delete allPicks[pickKey(list.id, itemId)];
        if (saveLists(all) && savePicks(allPicks)) { render(); showToast("Der Wunsch wurde entfernt."); }
      };
      openDialog(confirmDialog);
    } else if (action === "delete-list") {
      const list = getList(activeListId);
      if (!list || !isOwnerRoute(list)) return;
      document.getElementById("confirm-title").textContent = "Diese Wunschkiste löschen?";
      document.getElementById("confirm-copy").textContent = "Die Kiste und ihre Wünsche werden aus diesem Browser entfernt. Geteilte Links lassen sich danach hier nicht mehr öffnen.";
      document.getElementById("confirm-accept").textContent = "Kiste löschen";
      pendingConfirm = () => {
        const all = lists().filter((entry) => entry.id !== list.id);
        const allPicks = picks();
        Object.keys(allPicks).filter((key) => key.startsWith(`${list.id}:`)).forEach((key) => delete allPicks[key]);
        if (saveLists(all) && savePicks(allPicks)) {
          navigate({ kiste: null, verwalten: null, meine: "1" });
          showToast("Die Kiste wurde aus diesem Browser gelöscht.");
        }
      };
      openDialog(confirmDialog);
    } else if (action === "release" || action === "release-owner") {
      const listId = activeListId;
      const list = listId === "beispiel" ? sampleList : getList(listId);
      const itemId = actionButton.dataset.item;
      if (!list) return;
      if (action === "release-owner" && !isOwnerRoute(list)) return;
      if (action === "release-owner") {
        document.getElementById("confirm-title").textContent = "Diesen Wunsch wieder freigeben?";
        document.getElementById("confirm-copy").textContent = "Andere Gäste können ihn danach wieder auswählen.";
        document.getElementById("confirm-accept").textContent = "Freigeben";
        pendingConfirm = () => {
          if (itemId.startsWith("sample-")) return;
          const all = lists();
          const target = all.find((entry) => entry.id === list.id);
          const targetItem = target?.items.find((entry) => entry.id === itemId);
          if (targetItem) targetItem.claimed = false;
          const allPicks = picks();
          delete allPicks[pickKey(list.id, itemId)];
          if (saveLists(all) && savePicks(allPicks)) { render(); showToast("Der Wunsch ist wieder offen."); }
        };
        openDialog(confirmDialog);
      } else {
        const allPicks = picks();
        delete allPicks[pickKey(list.id, itemId)];
        if (savePicks(allPicks)) { render(); showToast("Deine Auswahl wurde freigegeben."); }
      }
    } else if (action === "claim") {
      const list = activeListId === "beispiel" ? sampleList : getList(activeListId);
      const itemId = actionButton.dataset.item;
      if (!list) return;
      const item = list.items.find((entry) => entry.id === itemId);
      if (!item) return;
      const currentlyClaimed = Boolean(item.sampleClaimed || item.claimed || picks()[pickKey(list.id, item.id)]);
      if (currentlyClaimed) { render(); showToast("Dieser Wunsch wurde gerade schon ausgesucht. Such dir gern einen anderen aus."); return; }
      const allPicks = picks();
      allPicks[pickKey(list.id, item.id)] = "planned";
      if (activeListId !== "beispiel") {
        const all = lists();
        const target = all.find((entry) => entry.id === list.id);
        const targetItem = target?.items.find((entry) => entry.id === item.id);
        if (!targetItem || targetItem.claimed) { render(); showToast("Dieser Wunsch wurde gerade schon ausgesucht. Such dir gern einen anderen aus."); return; }
        targetItem.claimed = true;
        if (!saveLists(all)) return;
      }
      if (savePicks(allPicks)) { render(); showToast("Für dich vorgemerkt. Dein Name wird niemandem angezeigt."); }
    } else if (action === "mark-bought") {
      const list = activeListId === "beispiel" ? sampleList : getList(activeListId);
      if (!list) return;
      const allPicks = picks();
      allPicks[pickKey(list.id, actionButton.dataset.item)] = "bought";
      if (savePicks(allPicks)) { render(); showToast("Als gekauft markiert. Viel Freude beim Verschenken!"); }
    }
  });

  document.querySelector('[data-nav="mine"]').addEventListener("click", (event) => {
    event.preventDefault();
    navigate({ meine: "1", kiste: null, verwalten: null });
  });

  document.querySelector('[data-nav="how"]').addEventListener("click", (event) => {
    const isHome = !new URLSearchParams(window.location.search).has("kiste") && new URLSearchParams(window.location.search).get("meine") !== "1";
    if (!isHome) {
      event.preventDefault();
      navigate({ meine: null, kiste: null, verwalten: null });
      requestAnimationFrame(() => document.getElementById("so-gehts")?.scrollIntoView({ behavior: "smooth" }));
    }
  });

  document.getElementById("create-dialog").addEventListener("close", () => {
    const form = document.getElementById("create-form");
    form.reset();
    delete form.dataset.editing;
    document.getElementById("create-title").textContent = "Womit feiern wir?";
    document.querySelector("#create-form .button-primary").innerHTML = "Kiste anlegen <span aria-hidden=\"true\">→</span>";
  });

  document.getElementById("wish-dialog").addEventListener("close", () => {
    const form = document.getElementById("wish-form");
    form.reset();
    delete form.dataset.editing;
    document.getElementById("wish-title").textContent = "Was wünscht sich das Geburtstagskind?";
    document.querySelector("#wish-form .button-primary").innerHTML = "Wunsch hinzufügen <span aria-hidden=\"true\">→</span>";
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMenu();
  });
  window.addEventListener("popstate", render);
  window.addEventListener("storage", (event) => {
    if (event.key === LISTS_KEY || event.key === PICKS_KEY) render();
  });

  render();
})();
