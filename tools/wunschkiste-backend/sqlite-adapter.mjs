import { DatabaseSync } from "node:sqlite";
import { readFileSync } from "node:fs";
export function createDatabase(path = ":memory:") {
  const database = new DatabaseSync(path);
  database.exec(readFileSync(new URL("schema.sql", import.meta.url), "utf8"));
  if(!database.prepare("PRAGMA table_info(lists)").all().some(column=>column.name==="description")) {
    database.exec(readFileSync(new URL("migrations/0001_list_description.sql",import.meta.url),"utf8"));
  }
  if(!database.prepare("PRAGMA table_info(lists)").all().some(column=>column.name==="creator_hash")) {
    database.exec("BEGIN");
    try {
      database.exec(readFileSync(new URL("migrations/0002_multiple_lists.sql",import.meta.url),"utf8"));
      database.exec("COMMIT");
    } catch(error) { database.exec("ROLLBACK"); throw error; }
  }
  if(!database.prepare("PRAGMA table_info(lists)").all().some(column=>column.name==="preview_at")) {
    database.exec("BEGIN");
    try {
      database.exec(readFileSync(new URL("migrations/0003_product_preview_budget.sql",import.meta.url),"utf8"));
      database.exec("COMMIT");
    } catch(error) { database.exec("ROLLBACK"); throw error; }
  }
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
