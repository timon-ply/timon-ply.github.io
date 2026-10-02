import { esc, randomKey, normalizeUrl, parsePrice, priceText, shopDomain, cleanPublicList, encodeSnapshot, decodeSnapshot } from "./domain.mjs?v=5.0";

const $ = id => document.getElementById(id);
const KEY = /^[a-f0-9]{64}$/;
const ID = /^[a-f0-9]{24}$/;
const storageKeys = { owner:"wk.v2.owner", owners:"wk.v3.owners", list:"wk.v2.list", guest:"wk.v2.guest", pending:"wk.v2.pending" };
const more = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>';
const share = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V2m-4 4 4-4 4 4M8 10H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-3"/></svg>';
let list = null, ownerKey = "", guestKey = "", routeId = "";
let snapshotMode = false, apiBase = String(window.WUNSCHKISTE_API || "").replace(/\/$/, "");
let detailId = "", busy = false, refreshing = false, serial = 0, toastTimer, undoAction = null;
const online = () => Boolean(apiBase && !snapshotMode);
const reducedMotion = matchMedia("(prefers-reduced-motion: reduce)");
const sheetAnimations = new WeakMap();
let importTimer, importController, importGeneration = 0;
let dirtyFields = new Set(), importedFields = new Map();

function savedOwners() {
  const entries = readStorage(storageKeys.owners);
  return Array.isArray(entries) ? entries.filter(entry => ID.test(entry?.id || "") && KEY.test(entry?.key || "") && typeof entry.title === "string") : [];
}
function rememberOwner(data, key = ownerKey, makeRecent = true) {
  if (!data?.isOwner || !ID.test(data.id) || !KEY.test(key)) return;
  try {
    const entry = {id:data.id,key,title:data.title,date:data.date || ""};
    const owners=savedOwners(), legacy=readStorage(storageKeys.owner);
    // V4 stored this capability only after a confirmed owner response. Preserve
    // it even when fetching its title fails during a later direct-link visit.
    if (ID.test(legacy?.id || "") && KEY.test(legacy?.key || "") && !owners.some(old=>old.id===legacy.id)) owners.push({...legacy,title:"Wunschkiste",date:""});
    storeValue(storageKeys.owners,[entry,...owners.filter(old => old.id !== data.id)].slice(0,500));
    if (makeRecent) storeValue(storageKeys.owner,{id:data.id,key});
  } catch { toast("Sichere deinen Verwaltungslink."); }
}
async function recoverLegacyOwner(updateRoot = false) {
  const old = readStorage(storageKeys.owner);
  if (!online() || !ID.test(old?.id || "") || !KEY.test(old?.key || "") || savedOwners().some(entry => entry.id === old.id)) return;
  try {
    const response = await fetch(apiBase + "/lists/" + old.id,{headers:{Authorization:"Bearer " + old.key},credentials:"omit",cache:"no-store",signal:AbortSignal.timeout(12000)});
    const data = response.ok ? await response.json() : null;
    if (data?.isOwner) {
      storeValue(storageKeys.owners,[...savedOwners(),{id:old.id,key:old.key,title:data.title,date:data.date || ""}]);
      if (updateRoot && !routeId && !list && !document.querySelector("dialog[open]")) emptyView();
    }
  } catch { /* The existing private link remains available for recovery. */ }
}
function openSavedLists() {
  $("saved-list-rows").innerHTML = savedOwners().map(entry => '<a class="saved-row" href="' + esc(routeUrl(entry.id,entry.key)) + '"><span><strong>' + esc(entry.title) + '</strong>' + (entry.date ? '<small>' + esc(new Intl.DateTimeFormat("de-DE",{day:"numeric",month:"long",year:"numeric"}).format(new Date(entry.date+"T12:00:00"))) + '</small>' : '') + '</span>' + (list?.isOwner && entry.id === routeId ? '<span aria-label="Aktuelle Liste">✓</span>' : '') + '</a>').join("");
  openSheet("saved-dialog");
}
function cancelImport() {
  clearTimeout(importTimer); importController?.abort(); importController = null; ++importGeneration;
}
function pricePosition(visible) {
  const field = $("price-field");
  if (visible) $("price-position").append(field);
  else $("extra-fields").querySelector("summary").after(field);
}
function showProductImage() {
  let src=""; try { src=normalizeUrl($("wish-image").value,true); } catch {}
  $("import-image").hidden = !src;
  if (src) $("product-image").src = src;
  else $("product-image").removeAttribute("src");
}
function importStatus(message, loading = false) {
  $("import-status").textContent = message;
  $("import-status").hidden = !message;
  $("import-status").classList.toggle("is-loading",loading);
}
function scheduleImport() {
  cancelImport(); importStatus("");
  for (const [id,value] of importedFields) if (!dirtyFields.has(id) && $(id).value === value) $(id).value = "";
  importedFields.clear(); $("price-hint").hidden = true; showProductImage();
  pricePosition(Boolean($("wish-price").value));
  if (!online() || !list?.isOwner || !$("wish-dialog").open) return;
  const value = $("wish-url").value.trim();
  let url; try { url = new URL(value); } catch { return; }
  if (url.protocol !== "https:") return;
  const generation = importGeneration, listId = routeId;
  importTimer = setTimeout(async () => {
    importController = new AbortController();
    importStatus("Angaben werden geladen …",true);
    const valid = () => generation === importGeneration && $("wish-dialog").open && routeId === listId && $("wish-url").value.trim() === value;
    try {
      const data = await api("/lists/" + listId + "/product-preview","POST",{url:value},{signal:importController.signal});
      if (!valid()) return;
      for (const [id,content] of Object.entries({"wish-name":data.title,"wish-image":data.imageUrl,"wish-price":data.priceCents == null ? "" : (data.priceCents/100).toFixed(2).replace(".",",")})) {
        if (content && !dirtyFields.has(id) && !$(id).value.trim()) { $(id).value = content; importedFields.set(id,content); }
      }
      const imported = importedFields.size > 0;
      pricePosition(imported || Boolean($("wish-price").value));
      $("price-hint").hidden = !importedFields.has("wish-price");
      showProductImage();
      importStatus(data.message || "");
    } catch (error) { if (valid()) importStatus(error.message); }
  },650);
}

function readStorage(key) { try { return JSON.parse(localStorage.getItem(key) || "null"); } catch { return null; } }
function storeValue(key, value) {
  try { localStorage.setItem(key, JSON.stringify(value)); }
  catch { throw new Error("Der Browser konnte nicht speichern. Bitte den Speicher prüfen."); }
}
function toast(message, undo = null) {
  $("toast-text").textContent = message;
  undoAction = undo;
  $("undo-button").hidden = !undo;
  $("toast").classList.add("show");
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { $("toast").classList.remove("show"); undoAction = null; }, undo ? 10000 : 4000);
}
function showError(id, message, field) {
  $(id).textContent = message;
  $(id).hidden = !message;
  if (field) { $(field).setAttribute("aria-invalid", "true"); $(field).focus(); }
}
function stopSheetAnimation(dialog) { sheetAnimations.get(dialog)?.cancel(); sheetAnimations.delete(dialog); }
function closeSheet(dialog, immediate = false) {
  if (!dialog?.open) return;
  if (dialog.id === "wish-dialog") cancelImport();
  stopSheetAnimation(dialog);
  if (immediate || reducedMotion.matches) { dialog.close(); return; }
  dialog.classList.add("is-closing");
  const animation = dialog.animate([{transform:"translateY(0)",opacity:1},{transform:"translateY(16px)",opacity:0}],{duration:160,easing:"ease-in",fill:"forwards"});
  sheetAnimations.set(dialog,animation);
  animation.finished.then(() => {
    if (sheetAnimations.get(dialog) !== animation) return;
    dialog.close(); stopSheetAnimation(dialog); dialog.classList.remove("is-closing");
  }).catch(() => {});
}
function closeAll() { document.querySelectorAll("dialog[open]").forEach(dialog => closeSheet(dialog,true)); }
function openSheet(id, focus) {
  const trigger=document.querySelector("dialog[open]")?.returnFocus || focusState();
  closeAll();
  $(id).returnFocus=trigger;
  $(id).classList.remove("is-closing");
  $(id).showModal();
  if (!reducedMotion.matches) {
    const animation = $(id).animate([{transform:"translateY(24px)",opacity:0},{transform:"translateY(0)",opacity:1}],{duration:220,easing:"cubic-bezier(.2,.8,.2,1)"});
    sheetAnimations.set($(id),animation);
  }
  if (focus) requestAnimationFrame(() => $(focus).focus());
}
function routeUrl(id, key = "") {
  const url = new URL(location.href);
  url.search = ""; url.hash = "";
  url.searchParams.set("kiste", id);
  if (key) url.hash = new URLSearchParams({ verwalten:key }).toString();
  return url.href;
}
function setOwnerRoute(id, key) {
  history.replaceState({}, "", routeUrl(id, key));
  routeId = id; ownerKey = key;
}
function requestHeaders(json = false) {
  const headers = {};
  if (json) headers["Content-Type"] = "application/json";
  if (ownerKey) headers.Authorization = "Bearer " + ownerKey;
  if (guestKey) headers["X-Claim-Key"] = guestKey;
  return headers;
}
async function api(path, method = "GET", body, options = {}) {
  const headers = requestHeaders(body !== undefined);
  let response;
  try {
    response = await fetch(apiBase + path, {
      method, headers, body:body === undefined ? undefined : JSON.stringify(body),
      cache:"no-store", credentials:"omit", signal:options.signal ? AbortSignal.any([options.signal,AbortSignal.timeout(12000)]) : AbortSignal.timeout(12000)
    });
  } catch { throw new Error("Die Liste ist gerade nicht erreichbar. Bitte erneut versuchen."); }
  const data = await response.json().catch(() => ({ error:"Die Liste ist gerade nicht erreichbar." }));
  if (!response.ok) { const error = new Error(data.error || "Speichern gerade nicht möglich."); error.status = response.status; throw error; }
  return data;
}
function publicState(raw, isOwner) {
  const clean = cleanPublicList(raw);
  return { ...clean, isOwner, items:clean.items.map(item => {
    const original = raw.items.find(entry => entry.id === item.id);
    return { ...item, status:["reserved","purchased"].includes(original.status) ? original.status : "open",
      mine:Boolean(original.claimKey && original.claimKey === guestKey),
      claimKey:original.claimKey || "", revision:original.revision || 1 };
  }) };
}
function localStorageKey() {
  const own = readStorage(storageKeys.list);
  return own?.id === routeId ? storageKeys.list : "wk.v2.shared." + routeId;
}
function saveLocal(raw) {
  storeValue(localStorageKey(), raw);
  list = publicState(raw, Boolean(ownerKey && readStorage(storageKeys.owner)?.key === ownerKey));
}
function localMutation(change) {
  const raw = readStorage(localStorageKey()) || list;
  if (!raw) throw new Error("Diese Liste wurde nicht gefunden.");
  const next = structuredClone(raw);
  change(next);
  saveLocal(next);
  return list;
}
function setHeading(title, date = "", local = false) {
  $("list-title").textContent=title;
  const parts=[];
  if(date) parts.push(new Intl.DateTimeFormat("de-DE",{day:"numeric",month:"long",year:"numeric"}).format(new Date(date+"T12:00:00")));
  if(local) parts.push("Lokaler Test");
  $("list-date-label").textContent=parts.join(" · "); $("list-date-label").hidden=!parts.length;
  $("list-description").textContent=list?.description || "";
  $("list-description").hidden=!list?.description;
}
function artwork(item, index, detail = false) {
  return item.imageUrl ? '<img class="wish-image' + (detail ? ' detail-art' : '') + '" src="' + esc(item.imageUrl) + '" alt="" loading="lazy" referrerpolicy="no-referrer" data-image>' : "";
}
function card(item, index) {
  const meta=[priceText(item.priceCents),shopDomain(item.url)].filter(Boolean).join(" · ");
  const status=!list.isOwner && item.status!=="open" ? '<span class="wish-status' + (item.mine ? " is-mine" : "") + '">' + (item.mine ? "Für dich" : "Vergeben") + '</span>' : "";
  return '<article class="wish-row"><button type="button" class="row-open" data-action="detail" data-id="' + item.id + '" aria-label="Details: ' + esc(item.title) + '"><div class="row-copy"><h2>' + esc(item.title) + '</h2>' + (meta ? '<p class="wish-meta">' + esc(meta) + '</p>' : "") + status + '</div>' + artwork(item,index) + '<svg class="row-chevron" viewBox="0 0 16 24" aria-hidden="true"><path d="m5 6 6 6-6 6"/></svg></button></article>';
}
function focusState() {
  const active=document.activeElement;
  return active?.matches("button,a") ? {scope:active.closest("dialog")?.id || (active.closest("header") ? "app-actions" : active.closest("#add-dock") ? "add-dock" : "main"),action:active.dataset.action,id:active.dataset.id,href:active.getAttribute("href")} : null;
}
function render(restoreFocus = null) {
  const active = document.activeElement;
  const focus = restoreFocus || focusState();
  $("app").setAttribute("aria-busy","false");
  $("app-actions").innerHTML = list ? '<button class="icon-button" type="button" data-action="share" aria-label="Liste teilen">' + share + '</button>' +
    '<button class="icon-button" type="button" data-action="menu" aria-label="Listenmenü">' + more + '</button>' : "";
  $("add-dock").innerHTML = list?.isOwner ? '<button class="primary" type="button" data-action="add"><span class="plus" aria-hidden="true">+</span>Wunsch hinzufügen</button>' : "";
  if (!list) return;
  setHeading(list.title,list.date,!online());
  document.title = list.title + " · Wunschkiste";
  const content = list.items.length ? '<section class="wish-list" aria-label="Wünsche">' + list.items.map(card).join("") + '</section>' :
    '<section class="empty"><p>Noch keine Wünsche</p></section>';
  $("app").innerHTML = content;
  attachImageFallback();
  if ($("detail-dialog").open) renderDetail();
  if (focus && (restoreFocus || !active.isConnected)) {
    const scope = $(focus.scope);
    const next = [...scope.querySelectorAll("button,a")].find(element => focus.action ? element.dataset.action === focus.action && element.dataset.id === focus.id : element.getAttribute("href") === focus.href);
    const fallback = focus.id ? [...scope.querySelectorAll("[data-action='detail']")].find(element => element.dataset.id === focus.id) : null;
    (next || fallback || scope.querySelector("[data-action='close']") || $("main")).focus({preventScroll:true});
  }
}
function attachImageFallback() {
  document.querySelectorAll("[data-image]").forEach(image => image.addEventListener("error", () => image.remove(), {once:true}));
}
function emptyView(kind = "new", message = "") {
  $("app").setAttribute("aria-busy","false"); $("app-actions").innerHTML = ""; $("add-dock").innerHTML = "";
  document.title = "Wunschkiste";
  setHeading("Wunschkiste");
  if (kind === "error") {
    setHeading("Liste nicht erreichbar");
    $("app").innerHTML = '<section class="empty"><p>' + esc(message) + '</p><button class="primary" type="button" data-action="retry">Erneut versuchen</button></section>';
  } else {
    const saved = readStorage(storageKeys.owner);
    const recent = savedOwners().length ? '<button class="text-button" type="button" data-action="saved-lists">Meine Wunschkisten</button>' : ID.test(saved?.id || "") && KEY.test(saved?.key || "") ? '<a class="text-button" href="' + esc(routeUrl(saved.id,saved.key)) + '">Meine letzte Wunschkiste öffnen</a>' : "";
    $("app").innerHTML = '<section class="empty start"><button class="primary" type="button" data-action="create">Wunschkiste erstellen</button><button class="text-button" type="button" data-action="open-invite">Einladungslink öffnen</button>' + recent + '</section>';
  }
}
async function load() {
  closeAll(); cancelImport();
  const currentSerial = ++serial;
  list = null; ownerKey = ""; routeId = ""; snapshotMode = false;
  try {
    guestKey = readStorage(storageKeys.guest);
    if (!KEY.test(guestKey || "")) { guestKey = randomKey(); storeValue(storageKeys.guest, guestKey); }
    const params = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.slice(1));
    if (hash.has("liste")) {
      snapshotMode = true;
      const decoded = decodeSnapshot(hash.get("liste"));
      routeId = decoded.id;
      const saved = readStorage(localStorageKey());
      if (!saved) storeValue(localStorageKey(), decoded);
      list = publicState(saved || decoded, false);
      render(); return;
    }
    const savedOwner = readStorage(storageKeys.owner);
    routeId = ID.test(params.get("kiste") || "") ? params.get("kiste") : "";
    ownerKey = KEY.test(hash.get("verwalten") || "") ? hash.get("verwalten") : "";
    if (online()) {
      if (routeId) {
        await recoverLegacyOwner();
        if (currentSerial !== serial) return;
        const data = await api("/lists/" + routeId);
        if (currentSerial !== serial) return;
        list = data;
        rememberOwner(data);
        render();
      } else {
        if (currentSerial === serial) { emptyView(); recoverLegacyOwner(true); if(params.get("neu") === "1" || KEY.test(hash.get("erstellen") || "")) openList(); }
      }
    } else {
      const raw = readStorage(storageKeys.list);
      if (raw && (!routeId || raw.id === routeId)) {
        routeId = raw.id;
        list = publicState(raw, Boolean(ownerKey && savedOwner?.key === ownerKey));
        render();
      } else if (routeId) emptyView("error", "Dieser Verwaltungslink ist nur auf dem ursprünglichen Gerät verfügbar.");
      else emptyView();
    }
  } catch(error) { if (currentSerial === serial) emptyView("error",error.message); }
}
async function refresh() {
  if (!list || !online() || busy || refreshing) return;
  refreshing = true;
  const currentSerial = serial;
  try {
    const data = await api("/lists/" + routeId);
    if (currentSerial === serial && !busy && JSON.stringify(list) !== JSON.stringify(data)) { list = data; render(); }
  } catch { /* Keep the last list; the next action reports a concrete error. */ }
  finally { refreshing = false; }
}
async function mutate(path, method, body, localChange) {
  if (busy) return null;
  const focus=focusState();
  busy = true; const mutationSerial = ++serial, mutationRoute = routeId;
  document.querySelectorAll('button[data-action="reserve"], #detail-dialog button:not([data-action="close"]), #wish-submit, #list-submit').forEach(button => button.disabled = true);
  try {
    const data = online() ? await api(path, method, body) : localMutation(localChange);
    if (serial !== mutationSerial || routeId !== mutationRoute) return null;
    list = data;
    rememberOwner(data);
    render(focus);
    return data;
  } catch(error) {
    if (serial !== mutationSerial || routeId !== mutationRoute) return null;
    if (error.status === 409 && online() && serial === mutationSerial && routeId === mutationRoute) {
      try { const data = await api("/lists/" + mutationRoute); if(serial === mutationSerial) { list=data; render(focus); } } catch {}
    }
    throw error;
  } finally {
    busy = false;
    document.querySelectorAll("button:disabled").forEach(button => button.disabled = false);
  }
}
function openList(edit = false) {
  if (busy) { toast("Speichern wird abgeschlossen …"); return; }
  $("list-form").reset(); $("list-form").dataset.edit = edit ? "1" : "";
  let creationKey = "";
  if(!edit) {
    const url = new URL(location.href), hash = new URLSearchParams(url.hash.slice(1));
    creationKey = KEY.test(hash.get("erstellen") || "") ? hash.get("erstellen") : randomKey();
    url.hash = new URLSearchParams({erstellen:creationKey}).toString();
    history.replaceState({},"",url.href);
  }
  $("list-form").dataset.creationKey = creationKey;
  const pending = edit ? null : readStorage(storageKeys.pending + "." + creationKey);
  $("list-name").value = edit ? list.title : pending?.title || "";
  $("list-date").value = edit ? list.date : pending?.date || "";
  $("list-description-input").value = edit ? list.description || "" : pending?.description || "";
  $("list-dialog-title").textContent = edit ? "Liste bearbeiten" : "Liste erstellen";
  $("list-submit").textContent = edit ? "Speichern" : "Erstellen";
  showError("list-error","");
  openSheet("list-dialog","list-name");
}
function openWish(id = "") {
  if (busy) { toast("Speichern wird abgeschlossen …"); return; }
  if (!list?.isOwner) return;
  const item = list.items.find(entry => entry.id === id);
  cancelImport(); dirtyFields = new Set(); importedFields = new Map(); importStatus(""); $("price-hint").hidden = true;
  $("wish-form").reset(); $("wish-form").dataset.id = item?.id || "";
  $("wish-form").dataset.revision = item?.revision || "";
  for (const [field,value] of Object.entries({ "wish-name":item?.title, "wish-url":item?.url, "wish-note":item?.note, "wish-image":item?.imageUrl })) $(field).value = value || "";
  $("wish-price").value = item?.priceCents === null || item?.priceCents === undefined ? "" : String(item.priceCents/100).replace(".",",");
  pricePosition(Boolean($("wish-price").value)); showProductImage();
  $("extra-fields").open = Boolean(item?.note);
  $("wish-dialog-title").textContent = item ? "Wunsch bearbeiten" : "Wunsch hinzufügen";
  $("wish-submit").textContent = item ? "Speichern" : "Hinzufügen";
  $("wish-form").querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute("aria-invalid"));
  showError("wish-error","");
  openSheet("wish-dialog",item ? "wish-name" : "wish-url");
}
function renderDetail() {
  const item = list?.items.find(entry => entry.id === detailId);
  if (!item) { closeSheet($("detail-dialog")); return; }
  let actions = "";
  if (list.isOwner) {
    actions = '<button class="primary" type="button" data-action="edit-wish" data-id="' + item.id + '">Bearbeiten</button>';
    if (item.status !== "open") actions += '<button class="secondary" type="button" data-action="release" data-id="' + item.id + '">Wieder freigeben</button>';
    actions += '<button class="text-button danger" type="button" data-action="remove" data-id="' + item.id + '">Wunsch entfernen</button>';
  } else if (item.status === "open") {
    actions = '<button class="primary" type="button" data-action="reserve" data-id="' + item.id + '">' + (online() ? "Reservieren" : "Auf diesem Gerät vormerken") + '</button>';
  } else if (item.mine) {
    if (item.status !== "purchased") actions += '<button class="secondary" type="button" data-action="buy" data-id="' + item.id + '">Als gekauft markieren</button>';
    actions += '<button class="text-button" type="button" data-action="release" data-id="' + item.id + '">Freigeben</button>';
  }
  const openGuest = !list.isOwner && item.status === "open";
  const shop = !list.isOwner && item.url && (openGuest || item.mine) ? '<a class="' + (openGuest ? "secondary" : "primary") + ' full" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">Zum Shop ↗</a>' : "";
  const domain = item.url ? (list.isOwner ? '<a class="detail-domain domain-link" href="' + esc(item.url) + '" target="_blank" rel="noopener noreferrer">' + esc(shopDomain(item.url)) + ' ↗</a>' : '<span class="detail-domain">' + esc(shopDomain(item.url)) + '</span>') : "";
  $("detail-content").innerHTML = '<div class="detail-content">' + artwork(item,list.items.indexOf(item),true) +
    '<h2 id="detail-title">' + esc(item.title) + '</h2>' +
    (item.priceCents !== null ? '<p class="detail-price">' + esc(priceText(item.priceCents)) + '</p>' : "") + domain +
    (item.note ? '<p class="detail-note">' + esc(item.note) + '</p>' : "") +
    (item.status !== "open" ? '<span class="detail-status" role="status">' + (item.mine ? (item.status === "purchased" ? "Von dir besorgt" : "Für dich reserviert") : "Vergeben") + '</span>' : "") +
    '<div class="detail-buttons">' + (openGuest ? actions + shop : shop + actions) + '</div></div>';
  attachImageFallback();
}
function openDetail(id) { if(busy) {toast("Speichern wird abgeschlossen …");return;} detailId = id; showError("detail-error",""); renderDetail(); openSheet("detail-dialog"); }
function guestLink() {
  if (online()) return routeUrl(routeId);
  const url = new URL(location.href); url.search = ""; url.hash = new URLSearchParams({liste:encodeSnapshot(list)}).toString();
  return url.href;
}
function openShare() {
  if (!list) return;
  try {
    $("guest-link").value = guestLink();
    $("owner-link").value = list.isOwner ? routeUrl(routeId,ownerKey) : "";
    $("private-link").hidden = !list.isOwner;
    $("private-link").open = false;
    $("share-note").textContent = online() ? "" : "Der Link enthält die Liste. Vormerkungen gelten nur auf dem jeweiligen Gerät.";
    openSheet("share-dialog");
  } catch(error) { toast(error.message); }
}
async function reservation(id, action) {
  const item = list.items.find(entry => entry.id === id);
  if (!item) return;
  const result = await mutate("/lists/" + routeId + "/items/" + id + "/reservation", "POST", {action}, raw => {
    const current = raw.items.find(entry => entry.id === id);
    if (action === "reserve") {
      if (current.status !== "open" && current.claimKey !== guestKey) throw new Error("Dieser Wunsch ist schon vergeben.");
      current.claimKey = guestKey; current.status = "reserved";
    } else if (action === "release") {
      if (!list.isOwner && current.claimKey !== guestKey) throw new Error("Dieser Wunsch gehört zu einer anderen Auswahl.");
      current.claimKey = ""; current.status = "open";
    } else if (action === "buy" && current.claimKey === guestKey) current.status = "purchased";
    else throw new Error("Diese Aktion ist nicht möglich.");
  });
  if (result) { if (!reducedMotion.matches) { const row=[...document.querySelectorAll("[data-action='detail']")].find(button=>button.dataset.id===id); [row?.querySelector(".wish-status"), detailId===id ? document.querySelector(".detail-status") : null].filter(Boolean).forEach(element => element.animate([{opacity:0},{opacity:1}],{duration:120})); } toast(action === "reserve" ? (online() ? "Für dich reserviert" : "Auf diesem Gerät vorgemerkt") : action === "buy" ? "Als gekauft markiert" : "Wieder verfügbar"); }
}
function finishCreation(data) {
  ownerKey = data.ownerKey; routeId = data.id; list = data;
  setOwnerRoute(routeId,ownerKey);
  try { rememberOwner({...data,isOwner:true}); localStorage.removeItem(storageKeys.pending + "." + ownerKey); }
  catch { toast("Sichere deinen Verwaltungslink."); }
  list.isOwner = true; render();
}

$("list-form").addEventListener("submit", async event => {
  event.preventDefault(); if (busy) return;
  const title = $("list-name").value.trim(), date = $("list-date").value, description=$("list-description-input").value.trim();
  if (!title) { showError("list-error","Gib der Liste einen Namen.","list-name"); return; }
  showError("list-error","");
  try {
    if ($("list-form").dataset.edit) {
      const result=await mutate("/lists/" + routeId,"PATCH",{title,date,description},raw => {raw.title=title;raw.date=date;raw.description=description;});
      if (!result) return;
    } else {
      busy = true; $("list-submit").disabled = true;
      const creationSerial=++serial;
      let data;
      if (online()) {
        const creationKey = $("list-form").dataset.creationKey;
        const pending = {title,date,description,ownerKey:creationKey};
        storeValue(storageKeys.pending + "." + creationKey,pending);
        data = await api("/lists","POST",pending);
      }
      else {
        if (readStorage(storageKeys.list)) throw new Error("Es gibt bereits eine Liste auf diesem Gerät.");
        data = {id:randomKey(12),ownerKey:randomKey(),title,date,description,isOwner:true,items:[]};
        storeValue(storageKeys.list,{id:data.id,title,date,description,items:[]});
      }
      rememberOwner({...data,isOwner:true},data.ownerKey,creationSerial===serial);
      if (creationSerial !== serial) return;
      finishCreation(data);
    }
    closeSheet($("list-dialog"));
  } catch(error) { showError("list-error",error.message); }
  finally { busy = false; $("list-submit").disabled = false; }
});
$("wish-form").addEventListener("submit", async event => {
  event.preventDefault(); if (busy || !list?.isOwner) return;
  cancelImport(); importStatus("");
  let body;
  const title = $("wish-name").value.trim();
  if (!title) { showError("wish-error","Wie heißt der Wunsch?","wish-name"); return; }
  try {
    let url, imageUrl, priceCents;
    try { url=normalizeUrl($("wish-url").value); } catch(error) { showError("wish-error",error.message,"wish-url"); return; }
    try { imageUrl=normalizeUrl($("wish-image").value,true); } catch(error) { $("extra-fields").open=true; showError("wish-error",error.message,"wish-image"); return; }
    try { priceCents=parsePrice($("wish-price").value); } catch(error) { $("extra-fields").open=true; showError("wish-error",error.message,"wish-price"); return; }
    body={title,url,imageUrl,priceCents,note:$("wish-note").value.trim()};
    const id=$("wish-form").dataset.id;
    if(id) body.revision=Number($("wish-form").dataset.revision);
    const previousIds = new Set(list.items.map(item => item.id));
    const result=await mutate("/lists/"+routeId+"/items"+(id?"/"+id:""),id?"PATCH":"POST",body,raw=>{
      if(id) {
        const item=raw.items.find(entry=>entry.id===id);
        if(!item || item.revision!==body.revision) throw new Error("Der Wunsch wurde inzwischen geändert.");
        Object.assign(item,body,{revision:item.revision+1});
      } else {
        if(raw.items.length>=30) throw new Error("Die Liste ist voll (maximal 30 Wünsche).");
        raw.items.push({...body,id:randomKey(12),status:"open",revision:1});
      }
    });
    if (!result) return;
    closeSheet($("wish-dialog"));
    if (!id && !reducedMotion.matches) document.querySelectorAll("[data-action='detail']").forEach(button => { if (!previousIds.has(button.dataset.id)) button.closest("article").animate([{transform:"translateY(8px)",opacity:0},{transform:"translateY(0)",opacity:1}],{duration:180,easing:"ease-out"}); });
    toast(id?"Wunsch gespeichert":"Wunsch hinzugefügt");
  } catch(error) { showError("wish-error",error.message); }
});
document.addEventListener("click", async event=>{
  const button=event.target.closest("[data-action]");
  if(!button || button.disabled) return;
  const action=button.dataset.action, id=button.dataset.id;
  try {
    if(action==="close") closeSheet(button.closest("dialog"));
    else if(action==="saved-lists") openSavedLists();
    else if(action==="change-image") { $("extra-fields").open=true; $("wish-image").focus(); }
    else if(action==="create") openList();
    else if(action==="edit-list") openList(true);
    else if(action==="add") openWish();
    else if(action==="edit-wish") openWish(id);
    else if(action==="detail") openDetail(id);
    else if(action==="menu") {
      $("menu-title").textContent = list.isOwner ? "Deine Liste" : "Wunschkiste";
      $("menu-edit").hidden = !list.isOwner;
      $("menu-guest").hidden = !list.isOwner;
      $("menu-lists").hidden = !savedOwners().length;
      openSheet("menu-dialog");
    }
    else if(action==="new-list") { const url=new URL(location.href); url.search="?neu=1"; url.hash=""; location.assign(url.href); }
    else if(action==="open-invite") { $("open-link-form").reset(); showError("invite-error",""); openSheet("invite-dialog","invite-url"); }
    else if(action==="share") openShare();
    else if(action==="retry") await load();
    else if(action==="guest-view") location.assign(guestLink());
    else if(action==="copy-guest" || action==="copy-owner") {
      const input=$(action==="copy-guest"?"guest-link":"owner-link");
      try { await navigator.clipboard.writeText(input.value); button.textContent="Kopiert"; setTimeout(()=>{button.textContent="Kopieren";},2500); }
      catch { input.focus(); input.select(); button.textContent="Link auswählen"; }
    } else if(["reserve","release","buy"].includes(action)) await reservation(id, action);
    else if(action==="remove" && list?.isOwner) {
      const deletionRoute=routeId, deletionKey=ownerKey;
      const old=structuredClone(list.items.find(item=>item.id===id));
      const result=await mutate("/lists/"+deletionRoute+"/items/"+id,"DELETE",undefined,raw=>{raw.items=raw.items.filter(item=>item.id!==id);});
      if (!result) return;
      closeSheet($("detail-dialog"));
      toast("Wunsch entfernt",async()=>{
        if(routeId!==deletionRoute || ownerKey!==deletionKey) return;
        try { const restored=await mutate("/lists/"+deletionRoute+"/items/"+id+"/restore","POST",{},raw=>{raw.items.push(old);}); if(restored)toast("Wunsch wiederhergestellt"); }
        catch(error) {toast(error.message);}
      });
    }
  } catch(error) { if($("detail-dialog").open) showError("detail-error",error.message); else toast(error.message); }
});
$("open-link-form").addEventListener("submit", event => {
  event.preventDefault();
  try {
    const url = new URL($("invite-url").value.trim());
    if (url.origin !== location.origin || url.pathname !== location.pathname) throw new Error("Bitte einen Wunschkiste-Link einfügen.");
    if (!ID.test(url.searchParams.get("kiste") || "") && !new URLSearchParams(url.hash.slice(1)).has("liste")) throw new Error("Bitte einen Wunschkiste-Link einfügen.");
    const hash = new URLSearchParams(url.hash.slice(1)); hash.delete("verwalten"); hash.delete("erstellen"); url.hash=hash.toString();
    location.assign(url.href);
  } catch(error) { showError("invite-error",error.message,"invite-url"); }
});
$("undo-button").addEventListener("click",()=>{const undo=undoAction;undoAction=null;$("toast").classList.remove("show");if(undo)undo();});
document.querySelectorAll("dialog").forEach(dialog=>{
dialog.addEventListener("cancel",event=>{event.preventDefault();closeSheet(dialog);});
dialog.addEventListener("close",()=>{
  stopSheetAnimation(dialog); dialog.classList.remove("is-closing");
  if (dialog.id === "wish-dialog") cancelImport();
  requestAnimationFrame(()=>{
    if(document.querySelector("dialog[open]")) return;
    const trigger=dialog.returnFocus;
    const buttons=[...document.querySelectorAll('button[data-action]')].filter(button=>!button.closest("dialog"));
    const target=trigger?.id ? buttons.find(button=>button.dataset.action==="detail" && button.dataset.id===trigger.id) : buttons.find(button=>button.dataset.action===trigger?.action);
    (target || (trigger?.action==="edit-list" ? buttons.find(button=>button.dataset.action==="menu") : null) || buttons.find(button=>button.dataset.action==="add") || $("app-actions").querySelector("button") || $("main")).focus({preventScroll:true});
  });
});
dialog.addEventListener("click",event=>{
  if(event.target!==dialog) return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) closeSheet(dialog);
});
});
document.querySelectorAll("input,textarea").forEach(input=>input.addEventListener("input",()=>input.removeAttribute("aria-invalid")));
$("wish-url").addEventListener("input",scheduleImport);
for (const id of ["wish-name","wish-price","wish-image","wish-note"]) $(id).addEventListener("input",()=>{dirtyFields.add(id);if(id==="wish-image")showProductImage();if(id==="wish-price")$("price-hint").hidden=true;});
$("product-image").addEventListener("error",()=>{$("import-image").hidden=true;});
reducedMotion.addEventListener("change",()=>{if(reducedMotion.matches) document.querySelectorAll("dialog[open]").forEach(dialog=>{stopSheetAnimation(dialog);if(dialog.classList.contains("is-closing"))closeSheet(dialog,true);});});
window.addEventListener("popstate",load); window.addEventListener("hashchange",load);
window.addEventListener("storage",()=>{if(!online()&&!busy)load();});
window.addEventListener("focus",refresh);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refresh();});
setInterval(()=>{if(document.visibilityState==="visible")refresh();},20000);
load();
