import test from "node:test";
import assert from "node:assert/strict";
import worker from "./worker.mjs";
import { createDatabase } from "./sqlite-adapter.mjs";
const ORIGIN = "https://timonply.com";
const SETUP = "c".repeat(64), GUEST_A = "a".repeat(64), GUEST_B = "b".repeat(64);
function harness() {
  const DB = createDatabase();
  const env = { DB, SETUP_KEY: SETUP, ALLOWED_ORIGIN: ORIGIN };
  async function call(path, method = "GET", body, credentials = {}, extra = {}) {
    const headers = { Origin:ORIGIN, ...extra };
    if (body !== undefined) headers["Content-Type"] = "application/json";
    if (credentials.owner) headers.Authorization = "Bearer " + credentials.owner;
    if (credentials.guest) headers["X-Claim-Key"] = credentials.guest;
    if (credentials.setup) headers["X-Setup-Key"] = credentials.setup;
    const response = await worker.fetch(new Request("https://test.workers.dev/api" + path, {
      method, headers, body:body === undefined ? undefined : JSON.stringify(body)
    }), env);
    return { status:response.status, data:await response.json(), headers:response.headers };
  }
  return { DB, call };
}
async function initialized() {
  const instance = harness();
  const created = await instance.call("/lists", "POST", {title:"Testliste",date:"2026-10-12",ownerKey:"d".repeat(64)}, {setup:SETUP});
  assert.equal(created.status, 200);
  instance.list = created.data;
  instance.path = "/lists/" + created.data.id;
  return instance;
}
const item = { title:"Ein Buch", url:"https://example.com/book?edition=2", imageUrl:"", priceCents:4999, note:"Deutsch" };

test("setup gate and singleton are enforced at the database boundary", async () => {
  const h = harness();
  try {
    assert.deepEqual((await h.call("/list")).data, {exists:false});
    assert.equal((await h.call("/lists","POST",{title:"Liste"})).status,403);
    const responses = await Promise.all([
      h.call("/lists","POST",{title:"Liste A",ownerKey:"d".repeat(64)},{setup:SETUP}),
      h.call("/lists","POST",{title:"Liste B",ownerKey:"e".repeat(64)},{setup:SETUP})
    ]);
    assert.deepEqual(responses.map(x=>x.status).sort(),[200,409]);
    assert.deepEqual((await h.call("/list")).data,{exists:true});
  } finally {h.DB.close();}
});

test("creation can be replayed after losing the response without losing management access", async () => {
  const h=harness(), ownerKey="f".repeat(64), body={title:"Wiederholbare Liste",date:"2026-10-12",ownerKey};
  try {
    await h.call("/lists","POST",body,{setup:SETUP}); // Simulate a response that never reaches the browser.
    const replay=await h.call("/lists","POST",body,{setup:SETUP});
    assert.equal(replay.status,200);
    assert.equal(replay.data.ownerKey,ownerKey);
    assert.equal((await h.call("/lists/"+replay.data.id,"GET",undefined,{owner:ownerKey})).data.isOwner,true);
    assert.equal((await h.call("/lists","POST",{...body,ownerKey:"e".repeat(64)},{setup:SETUP})).status,409);
    assert.equal((await h.call("/lists","POST",{title:"No key"},{setup:SETUP})).status,400);
    const count=await h.DB.prepare("SELECT COUNT(*) AS count FROM lists").first();
    assert.equal(count.count,1);
  } finally {h.DB.close();}
});

test("guests cannot modify list contents or read management and reservation secrets", async () => {
  const h=await initialized();
  try {
    assert.equal((await h.call(h.path+"/items","POST",item)).status,403);
    assert.equal((await h.call(h.path,"PATCH",{title:"Hijack"})).status,403);
    await h.call(h.path+"/items","POST",item,{owner:h.list.ownerKey});
    const guest=await h.call(h.path);
    assert.equal(guest.data.isOwner,false);
    assert.equal(guest.data.items[0].url,item.url);
    assert.equal(guest.data.items[0].priceCents,4999);
    const serialized=JSON.stringify(guest.data);
    assert.ok(!serialized.includes(h.list.ownerKey));
    assert.ok(!/owner_hash|ownerKey|claim_hash|claimKey|reserved_at/.test(serialized));
    assert.equal(guest.headers.get("cache-control"),"no-store");
  } finally {h.DB.close();}
});

test("two independent guests race for one wish: exactly one succeeds", async () => {
  const h=await initialized();
  try {
    const added=await h.call(h.path+"/items","POST",item,{owner:h.list.ownerKey});
    const id=added.data.items[0].id, path=h.path+"/items/"+id+"/reservation";
    const results=await Promise.all([
      h.call(path,"POST",{action:"reserve"},{guest:GUEST_A}),
      h.call(path,"POST",{action:"reserve"},{guest:GUEST_B})
    ]);
    assert.deepEqual(results.map(x=>x.status).sort(),[200,409]);
    const winner=results[0].status===200?GUEST_A:GUEST_B;
    const loser=winner===GUEST_A?GUEST_B:GUEST_A;
    const own=await h.call(h.path,"GET",undefined,{guest:winner});
    const other=await h.call(h.path,"GET",undefined,{guest:loser});
    assert.equal(own.data.items[0].mine,true);
    assert.equal(other.data.items[0].mine,false);
    assert.equal(other.data.items[0].status,"reserved");
    assert.equal((await h.call(path,"POST",{action:"release"},{guest:loser})).status,409);
    assert.equal((await h.call(path,"POST",{action:"buy"},{guest:loser})).status,409);
    const purchased=await h.call(path,"POST",{action:"buy"},{guest:winner});
    assert.equal(purchased.data.items[0].status,"purchased");
    const stored=await h.DB.prepare("SELECT claim_hash FROM items WHERE id = ?").bind(id).first();
    assert.ok(stored.claim_hash && stored.claim_hash!==winner);
    assert.equal((await h.call(path,"POST",{action:"release"},{owner:h.list.ownerKey})).data.items[0].status,"open");
    assert.equal((await h.call(path,"POST",{action:"reserve"},{guest:loser})).status,200);
  } finally {h.DB.close();}
});

test("owner edits preserve reservations and reject stale revisions", async () => {
  const h=await initialized();
  try {
    const added=await h.call(h.path+"/items","POST",item,{owner:h.list.ownerKey});
    const id=added.data.items[0].id, path=h.path+"/items/"+id;
    await h.call(path+"/reservation","POST",{action:"reserve"},{guest:GUEST_A});
    const edited=await h.call(path,"PATCH",{...item,title:"Neue Ausgabe",revision:1},{owner:h.list.ownerKey});
    assert.equal(edited.status,200);
    assert.equal(edited.data.items[0].status,"reserved");
    assert.equal(edited.data.items[0].revision,2);
    assert.equal((await h.call(path,"PATCH",{...item,revision:1},{owner:h.list.ownerKey})).status,409);
  } finally {h.DB.close();}
});

test("removed wishes are hidden and can be restored with their reservation", async () => {
  const h=await initialized();
  try {
    const added=await h.call(h.path+"/items","POST",item,{owner:h.list.ownerKey});
    const id=added.data.items[0].id, path=h.path+"/items/"+id;
    await h.call(path+"/reservation","POST",{action:"reserve"},{guest:GUEST_A});
    assert.equal((await h.call(path,"DELETE",undefined,{owner:h.list.ownerKey})).data.items.length,0);
    assert.equal((await h.call(path+"/restore","POST",{}, {guest:GUEST_A})).status,403);
    const restored=await h.call(path+"/restore","POST",{}, {owner:h.list.ownerKey});
    assert.equal(restored.data.items[0].status,"reserved");
    assert.equal(restored.data.items[0].revision,3);
  } finally {h.DB.close();}
});

test("unsafe links, oversized input, invalid dates, and foreign origins are rejected", async () => {
  const h=await initialized();
  try {
    for(const invalid of [
      {...item,url:"javascript:alert(1)"}, {...item,url:"https://user:secret@example.com/"},
      {...item,imageUrl:"http://example.com/image.png"}, {...item,priceCents:-1},
      {...item,title:""}, {...item,note:"x".repeat(241)}
    ]) assert.equal((await h.call(h.path+"/items","POST",invalid,{owner:h.list.ownerKey})).status,400);
    assert.equal((await h.call(h.path,"PATCH",{title:"Test",date:"2026-02-31"},{owner:h.list.ownerKey})).status,400);
    assert.equal((await h.call(h.path+"/items","POST",{...item,note:"x".repeat(17000)},{owner:h.list.ownerKey})).status,413);
    assert.equal((await h.call(h.path+"/items","POST",item,{owner:h.list.ownerKey},{Origin:"https://untrusted.example"})).status,403);
    assert.equal((await h.call(h.path)).data.items.length,0);
  } finally {h.DB.close();}
});

test("active wishes are bounded to thirty", async () => {
  const h=await initialized();
  try {
    for(let i=0;i<30;i++) assert.equal((await h.call(h.path+"/items","POST",{...item,title:"Wunsch "+i},{owner:h.list.ownerKey})).status,200);
    assert.equal((await h.call(h.path+"/items","POST",item,{owner:h.list.ownerKey})).status,409);
    assert.equal((await h.call(h.path)).data.items.length,30);
  } finally {h.DB.close();}
});

test("an unavailable database produces a failure response", async () => {
  const response=await worker.fetch(new Request("https://test.workers.dev/api/list"),{});
  assert.equal(response.status,503);
  assert.match((await response.json()).error,/nicht erreichbar/);
});
