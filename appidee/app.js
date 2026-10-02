import { esc, randomKey, normalizeUrl, parsePrice, priceText, shopDomain, cleanPublicList, encodeSnapshot, decodeSnapshot } from "./domain.mjs";

const $ = id => document.getElementById(id);
const KEY = /^[a-f0-9]{64}$/;
const ID = /^[a-f0-9]{24}$/;
const storageKeys = { owner:"wk.v2.owner", list:"wk.v2.list", guest:"wk.v2.guest", pending:"wk.v2.pending" };
const more = '<svg viewBox="0 0 24 24" aria-hidden="true"><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></svg>';
const share = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V2m-4 4 4-4 4 4M8 10H5a1 1 0 0 0-1 1v9a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-9a1 1 0 0 0-1-1h-3"/></svg>';
let list = null, ownerKey = "", guestKey = "", routeId = "", setupKey = "";
let snapshotMode = false, apiBase = String(window.WUNSCHKISTE_API || "").replace(/\/$/, "");
let detailId = "", busy = false, refreshing = false, serial = 0, toastTimer, undoAction = null;
const online = () => Boolean(apiBase && !snapshotMode);

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
function closeAll() { document.querySelectorAll("dialog[open]").forEach(dialog => dialog.close()); }
function openSheet(id, focus) {
  closeAll();
  $(id).showModal();
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
async function api(path, method = "GET", body) {
  const headers = requestHeaders(body !== undefined);
  if (setupKey && path === "/lists") headers["X-Setup-Key"] = setupKey;
  let response;
  try {
    response = await fetch(apiBase + path, {
      method, headers, body:body === undefined ? undefined : JSON.stringify(body),
      cache:"no-store", credentials:"omit", signal:AbortSignal.timeout(12000)
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
  if(date) parts.push(new Intl.DateTimeFormat("de-DE",{day:"numeric",month:"long"}).format(new Date(date+"T12:00:00")));
  if(local) parts.push("Lokaler Test");
  $("list-date-label").textContent=parts.join(" · "); $("list-date-label").hidden=!parts.length;
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
  return active?.matches("button,a") ? {scope:active.closest("dialog")?.id || (active.closest("header") ? "app-actions" : "main"),action:active.dataset.action,id:active.dataset.id,href:active.getAttribute("href")} : null;
}
function render(restoreFocus = null) {
  const active = document.activeElement;
  const focus = restoreFocus || focusState();
  $("app").setAttribute("aria-busy","false");
  $("app-actions").innerHTML = list ? '<button class="icon-button" type="button" data-action="share" aria-label="Liste teilen">' + share + '</button>' +
    (list.isOwner ? '<button class="icon-button" type="button" data-action="menu" aria-label="Listenmenü">' + more + '</button>' : "") : "";
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
  if (kind === "exists") {
    setHeading("Einladungslink öffnen");
    $("app").innerHTML = '<section class="empty"><form class="open-link-form" id="open-link-form"><input id="invite-url" aria-label="Einladungslink" placeholder="Link einfügen" inputmode="url" required><button class="primary" type="submit">Öffnen</button></form></section>';
    $("open-link-form").addEventListener("submit", event => {
      event.preventDefault();
      try {
        const url = new URL($("invite-url").value);
        if (url.origin !== location.origin || url.pathname !== location.pathname) throw new Error("Bitte einen Wunschkiste-Link einfügen.");
        if (!ID.test(url.searchParams.get("kiste") || "") && !new URLSearchParams(url.hash.slice(1)).has("liste")) throw new Error("Bitte einen Wunschkiste-Link einfügen.");
        location.assign(url.href);
      } catch(error) { toast(error.message); }
    });
  } else if (kind === "error") {
    setHeading("Liste nicht erreichbar");
    $("app").innerHTML = '<section class="empty"><p>' + esc(message) + '</p><button class="primary" type="button" data-action="retry">Erneut versuchen</button></section>';
  } else {
    setHeading("Deine Wunschliste");
    $("app").innerHTML = '<section class="empty"><button class="primary" type="button" data-action="create">Liste erstellen</button></section>';
  }
}
async function load() {
  const currentSerial = ++serial;
  list = null; ownerKey = ""; routeId = ""; snapshotMode = false;
  try {
    guestKey = readStorage(storageKeys.guest);
    if (!KEY.test(guestKey || "")) { guestKey = randomKey(); storeValue(storageKeys.guest, guestKey); }
    const params = new URLSearchParams(location.search);
    const hash = new URLSearchParams(location.hash.slice(1));
    setupKey = KEY.test(hash.get("setup") || "") ? hash.get("setup") : "";
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
    if (!routeId && !params.has("kiste") && ID.test(savedOwner?.id || "") && KEY.test(savedOwner?.key || "")) {
      routeId = savedOwner.id; ownerKey = savedOwner.key;
      setOwnerRoute(routeId, ownerKey);
    }
    if (online()) {
      const pending = readStorage(storageKeys.pending);
      if (!routeId && KEY.test(pending?.ownerKey || "")) {
        const data = await api("/lists","POST",pending);
        if (currentSerial !== serial) return;
        finishCreation(data); return;
      }
      if (routeId) {
        const data = await api("/lists/" + routeId);
        if (currentSerial !== serial) return;
        list = data;
        if (ownerKey && data.isOwner) { try { storeValue(storageKeys.owner, {id:routeId,key:ownerKey}); } catch { toast("Sichere deinen Verwaltungslink."); } }
        render();
      } else {
        const result = await api("/list");
        if (currentSerial === serial) emptyView(result.exists ? "exists" : "new");
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
  busy = true; ++serial;
  document.querySelectorAll('button[data-action="reserve"], #detail-dialog button, #wish-submit, #list-submit').forEach(button => button.disabled = true);
  try {
    const data = online() ? await api(path, method, body) : localMutation(localChange);
    list = data;
    render(focus);
    return data;
  } catch(error) {
    if (error.status === 409 && online()) {
      try { list = await api("/lists/" + routeId); render(focus); } catch {}
    }
    throw error;
  } finally {
    busy = false;
    document.querySelectorAll("button:disabled").forEach(button => button.disabled = false);
  }
}
function openList(edit = false) {
  $("list-form").reset(); $("list-form").dataset.edit = edit ? "1" : "";
  $("list-name").value = edit ? list.title : "";
  $("list-date").value = edit ? list.date : "";
  $("list-dialog-title").textContent = edit ? "Liste bearbeiten" : "Liste erstellen";
  $("list-submit").textContent = edit ? "Speichern" : "Erstellen";
  showError("list-error","");
  openSheet("list-dialog","list-name");
}
function openWish(id = "") {
  if (!list?.isOwner) return;
  const item = list.items.find(entry => entry.id === id);
  $("wish-form").reset(); $("wish-form").dataset.id = item?.id || "";
  $("wish-form").dataset.revision = item?.revision || "";
  for (const [field,value] of Object.entries({ "wish-name":item?.title, "wish-url":item?.url, "wish-note":item?.note, "wish-image":item?.imageUrl })) $(field).value = value || "";
  $("wish-price").value = item?.priceCents === null || item?.priceCents === undefined ? "" : String(item.priceCents/100).replace(".",",");
  $("extra-fields").open = Boolean(item && (item.priceCents !== null || item.note || item.imageUrl));
  $("wish-dialog-title").textContent = item ? "Wunsch bearbeiten" : "Wunsch hinzufügen";
  $("wish-submit").textContent = item ? "Speichern" : "Hinzufügen";
  $("wish-form").querySelectorAll('[aria-invalid]').forEach(input => input.removeAttribute("aria-invalid"));
  showError("wish-error","");
  openSheet("wish-dialog",item ? "wish-name" : "wish-url");
}
function renderDetail() {
  const item = list?.items.find(entry => entry.id === detailId);
  if (!item) { $("detail-dialog").close(); return; }
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
function openDetail(id) { detailId = id; showError("detail-error",""); renderDetail(); openSheet("detail-dialog"); }
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
  if (result) toast(action === "reserve" ? (online() ? "Für dich reserviert" : "Auf diesem Gerät vorgemerkt") : action === "buy" ? "Als gekauft markiert" : "Wieder verfügbar");
}
function finishCreation(data) {
  ownerKey = data.ownerKey; routeId = data.id; list = data;
  setOwnerRoute(routeId,ownerKey);
  try { storeValue(storageKeys.owner,{id:routeId,key:ownerKey}); localStorage.removeItem(storageKeys.pending); }
  catch { toast("Sichere deinen Verwaltungslink."); }
  list.isOwner = true; render();
}

$("list-form").addEventListener("submit", async event => {
  event.preventDefault(); if (busy) return;
  const title = $("list-name").value.trim(), date = $("list-date").value;
  if (!title) { showError("list-error","Gib der Liste einen Namen.","list-name"); return; }
  showError("list-error","");
  try {
    if ($("list-form").dataset.edit) {
      await mutate("/lists/" + routeId,"PATCH",{title,date},raw => {raw.title=title;raw.date=date;});
    } else {
      busy = true; $("list-submit").disabled = true;
      let data;
      if (online()) {
        const previous = readStorage(storageKeys.pending);
        const pending = {title,date,ownerKey:KEY.test(previous?.ownerKey || "") ? previous.ownerKey : randomKey()};
        storeValue(storageKeys.pending,pending);
        data = await api("/lists","POST",pending);
      }
      else {
        if (readStorage(storageKeys.list)) throw new Error("Es gibt bereits eine Liste auf diesem Gerät.");
        data = {id:randomKey(12),ownerKey:randomKey(),title,date,isOwner:true,items:[]};
        storeValue(storageKeys.list,{id:data.id,title,date,items:[]});
      }
      finishCreation(data);
    }
    $("list-dialog").close();
  } catch(error) { showError("list-error",error.message); }
  finally { busy = false; $("list-submit").disabled = false; }
});
$("wish-form").addEventListener("submit", async event => {
  event.preventDefault(); if (busy || !list?.isOwner) return;
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
    await mutate("/lists/"+routeId+"/items"+(id?"/"+id:""),id?"PATCH":"POST",body,raw=>{
      if(id) {
        const item=raw.items.find(entry=>entry.id===id);
        if(!item || item.revision!==body.revision) throw new Error("Der Wunsch wurde inzwischen geändert.");
        Object.assign(item,body,{revision:item.revision+1});
      } else {
        if(raw.items.length>=30) throw new Error("Die Liste ist voll (maximal 30 Wünsche).");
        raw.items.push({...body,id:randomKey(12),status:"open",revision:1});
      }
    });
    $("wish-dialog").close(); toast(id?"Wunsch gespeichert":"Wunsch hinzugefügt");
  } catch(error) { showError("wish-error",error.message); }
});
document.addEventListener("click", async event=>{
  const button=event.target.closest("[data-action]");
  if(!button || button.disabled) return;
  const action=button.dataset.action, id=button.dataset.id;
  try {
    if(action==="close") button.closest("dialog")?.close();
    else if(action==="create") openList();
    else if(action==="edit-list") openList(true);
    else if(action==="add") openWish();
    else if(action==="edit-wish") openWish(id);
    else if(action==="detail") openDetail(id);
    else if(action==="menu") openSheet("menu-dialog");
    else if(action==="share") openShare();
    else if(action==="retry") await load();
    else if(action==="guest-view") location.assign(guestLink());
    else if(action==="copy-guest" || action==="copy-owner") {
      const input=$(action==="copy-guest"?"guest-link":"owner-link");
      try { await navigator.clipboard.writeText(input.value); button.textContent="Kopiert"; setTimeout(()=>{button.textContent="Kopieren";},2500); }
      catch { input.focus(); input.select(); button.textContent="Link auswählen"; }
    } else if(["reserve","release","buy"].includes(action)) await reservation(id, action);
    else if(action==="remove" && list?.isOwner) {
      const old=structuredClone(list.items.find(item=>item.id===id));
      await mutate("/lists/"+routeId+"/items/"+id,"DELETE",undefined,raw=>{raw.items=raw.items.filter(item=>item.id!==id);});
      $("detail-dialog").close();
      toast("Wunsch entfernt",async()=>{
        try { await mutate("/lists/"+routeId+"/items/"+id+"/restore","POST",{},raw=>{raw.items.push(old);}); toast("Wunsch wiederhergestellt"); }
        catch(error) {toast(error.message);}
      });
    }
  } catch(error) { if($("detail-dialog").open) showError("detail-error",error.message); else toast(error.message); }
});
$("undo-button").addEventListener("click",()=>{const undo=undoAction;undoAction=null;$("toast").classList.remove("show");if(undo)undo();});
document.querySelectorAll("dialog").forEach(dialog=>dialog.addEventListener("click",event=>{
  if(event.target!==dialog) return;
  const rect=dialog.getBoundingClientRect();
  if(event.clientX<rect.left || event.clientX>rect.right || event.clientY<rect.top || event.clientY>rect.bottom) dialog.close();
}));
document.querySelectorAll("input,textarea").forEach(input=>input.addEventListener("input",()=>input.removeAttribute("aria-invalid")));
window.addEventListener("popstate",load); window.addEventListener("hashchange",load);
window.addEventListener("storage",()=>{if(!online()&&!busy)load();});
window.addEventListener("focus",refresh);
document.addEventListener("visibilitychange",()=>{if(document.visibilityState==="visible")refresh();});
setInterval(()=>{if(document.visibilityState==="visible")refresh();},20000);
load();
