import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
export function createDatabase(path = ":memory:") {
  const database = new DatabaseSync(path);
  database.exec(readFileSync(new URL("schema.sql", import.meta.url), "utf8"));
  return {
    close: () => database.close(),
    prepare(sql) {
      return {
        values: [],
        bind(...values) { this.values = values; return this; },
        async first() { return database.prepare(sql).get(...this.values) || null; },
        async all() { return { results: database.prepare(sql).all(...this.values) }; },
        async run() {
          const result = database.prepare(sql).run(...this.values);
          return { meta: { changes: Number(result.changes) } };
        }
      };
    }
  };
}
