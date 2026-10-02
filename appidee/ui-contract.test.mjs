import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

test("HTML IDs are unique and form labels resolve to inputs", () => {
  const html=readFileSync(new URL("./index.html",import.meta.url),"utf8");
  const ids=[...html.matchAll(/\bid="([^"]+)"/g)].map(match=>match[1]);
  assert.equal(ids.length,new Set(ids).size,"Duplicate IDs break form input and header lookup");
  const controls=new Set([...html.matchAll(/<(?:input|textarea)\b[^>]*\bid="([^"]+)"/g)].map(match=>match[1]));
  for(const match of html.matchAll(/<label\b[^>]*\bfor="([^"]+)"/g)) assert.ok(controls.has(match[1]),"Label points to a non-input: "+match[1]);
});
