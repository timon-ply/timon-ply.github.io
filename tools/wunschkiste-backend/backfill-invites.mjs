import { randomBytes } from "node:crypto";
import { readFileSync, writeFileSync } from "node:fs";
import { pathToFileURL } from "node:url";

// Accept the JSON output of `wrangler d1 execute ... --json` or a plain row
// array. This tool emits SQL only; it never connects to or mutates a database.
export function invitationBackfill(input, generate = () => randomBytes(5).toString("hex")) {
  if (!Array.isArray(input)) throw new Error("Expected Wrangler JSON results or rows.");
  const rows = input.flatMap(part => Array.isArray(part?.results) ? part.results : [part]);
  if (rows.length > 500) throw new Error("Unexpected list count; inspect before backfilling.");
  const ids = new Set(), codes = new Set();
  for (const row of rows) {
    if (!row || !/^[a-f0-9]{24}$/.test(row.id || "") || ids.has(row.id)) throw new Error("Invalid or duplicate list ID.");
    ids.add(row.id);
    if (row.invite_code !== null) {
      if (!/^[a-f0-9]{10}$/.test(row.invite_code || "") || codes.has(row.invite_code)) throw new Error("Invalid or duplicate existing code.");
      codes.add(row.invite_code);
    }
  }
  const statements = [];
  for (const row of rows.filter(row => row.invite_code === null)) {
    let code;
    for (let attempt = 0; attempt < 20; attempt++) {
      const candidate = generate();
      if (!/^[a-f0-9]{10}$/.test(candidate || "")) throw new Error("Invalid generated code.");
      if (!codes.has(candidate)) { code = candidate; break; }
    }
    if (!code) throw new Error("Could not allocate a unique invitation code.");
    codes.add(code);
    statements.push(`UPDATE lists SET invite_code = '${code}' WHERE id = '${row.id}' AND invite_code IS NULL;`);
  }
  return "-- CSPRNG invitation backfill; existing codes are never replaced.\n" + (statements.length ? statements.join("\n") : "SELECT COUNT(*) AS lists_without_code FROM lists WHERE invite_code IS NULL;") + "\n";
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const [, , inputPath, outputPath] = process.argv;
  if (!inputPath || !outputPath) throw new Error("Usage: node backfill-invites.mjs lists.json backfill.sql");
  const source = readFileSync(inputPath, "utf8").replace(/^\uFEFF/, "");
  if (source.length > 1000000) throw new Error("Input exceeds the bounded migration size.");
  const sql = invitationBackfill(JSON.parse(source));
  writeFileSync(outputPath, sql, { encoding: "utf8", flag: "wx" });
  console.log("Backfill SQL written. No database was changed.");
}
