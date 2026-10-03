import test from "node:test";
import assert from "node:assert/strict";
import { normalizeUrl, parsePrice, encodeSnapshot, decodeSnapshot, cleanPublicList, esc } from "./domain.mjs";
test("product links keep the full destination and reject executable protocols and credentials",()=>{
  assert.equal(normalizeUrl("example.com/product?size=2#color"),"https://example.com/product?size=2#color");
  for(const value of ["javascript:alert(1)","data:text/html,x","https://name:password@example.com"]) assert.throws(()=>normalizeUrl(value));
});
test("German prices are converted to cents without silently dropping the comma",()=>{
  assert.equal(parsePrice("49,99"),4999); assert.equal(parsePrice("49.99"),4999);
  assert.equal(parsePrice("0"),0); assert.equal(parsePrice(""),null);
  for(const value of ["49,999","-2","2e3","1.234,56"]) assert.throws(()=>parsePrice(value));
});
test("portable local links roundtrip Unicode but strip owner keys and reservations",()=>{
  const list={id:"a".repeat(24),title:"Für Mia 🎁",date:"2026-10-12",ownerKey:"secret",items:[
    {id:"b".repeat(24),title:"Überraschung",url:"https://example.com/gift",imageUrl:"",priceCents:100,note:"Größe M",claimKey:"private",status:"reserved"}
  ]};
  const result=decodeSnapshot(encodeSnapshot(list));
  assert.equal(result.title,list.title); assert.equal(result.items[0].note,"Größe M");
  assert.equal(result.ownerKey,undefined); assert.equal(result.items[0].claimKey,undefined);
  assert.equal(result.items[0].status,"open");
});
test("snapshot and rendering boundaries reject malformed input and escape HTML",()=>{
  assert.throws(()=>decodeSnapshot("not_a_valid_list"));
  assert.throws(()=>decodeSnapshot("x".repeat(16001)));
  assert.equal(esc('<img src=x onerror="alert(1)">'),"&lt;img src=x onerror=&quot;alert(1)&quot;&gt;");
});


test("snapshot keeps selected cover and excludes private invitation code", () => {
  const source={id:"a".repeat(24),title:"Birthday",date:"",description:"",coverId:"cover_09",inviteCode:"A12BC34DEF",items:[]};
  const clean=decodeSnapshot(encodeSnapshot(source));
  assert.equal(clean.coverId,"cover_09");assert.equal(clean.inviteCode,undefined);
  assert.equal(cleanPublicList({...source,coverId:"../secret"}).coverId,"cover_01");
});
