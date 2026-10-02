import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { resolve, relative, extname } from "node:path";
import worker from "./worker.mjs";
import { createDatabase } from "./sqlite-adapter.mjs";
const root = fileURLToPath(new URL("../../", import.meta.url));
const local = fileURLToPath(new URL(".local/", import.meta.url));
mkdirSync(local, { recursive: true });
const DB = createDatabase(resolve(local, "test.sqlite"));
const port = Number(process.env.PORT || 8765);
const types = { ".html": "text/html; charset=utf-8", ".js": "application/javascript; charset=utf-8", ".mjs": "application/javascript; charset=utf-8", ".css": "text/css; charset=utf-8", ".webp": "image/webp", ".svg": "image/svg+xml" };
const server = createServer(async (incoming, outgoing) => {
  try {
    const url = new URL(incoming.url, "http://127.0.0.1:" + port);
    if (url.pathname.startsWith("/api/")) {
      const chunks = [];
      let size = 0;
      for await (const chunk of incoming) {
        size += chunk.length;
        if (size > 16384) { outgoing.writeHead(413).end(); return; }
        chunks.push(chunk);
      }
      const request = new Request(url, {
        method: incoming.method, headers: incoming.headers,
        body: chunks.length ? Buffer.concat(chunks) : undefined
      });
      const response = await worker.fetch(request, { DB, DEV_MODE: "true" });
      outgoing.writeHead(response.status, Object.fromEntries(response.headers)).end(Buffer.from(await response.arrayBuffer()));
      return;
    }
    if (url.pathname === "/appidee/config.js") {
      outgoing.writeHead(200, { "Content-Type": types[".js"], "Cache-Control": "no-store" });
      outgoing.end('window.WUNSCHKISTE_API = "/api";');
      return;
    }
    const file = resolve(root, "." + decodeURIComponent(url.pathname) + (url.pathname.endsWith("/") ? "index.html" : ""));
    if (relative(root, file).startsWith("..") || relative(root, file).split(/[\\/]/)[0] !== "appidee") {
      outgoing.writeHead(404).end(); return;
    }
    const bytes = await readFile(file);
    outgoing.writeHead(200, { "Content-Type": types[extname(file)] || "application/octet-stream", "Cache-Control": "no-store" }).end(bytes);
  } catch { outgoing.writeHead(404).end("Not found"); }
});
server.listen(port, "127.0.0.1", () => console.log("Wunschkiste local test: http://127.0.0.1:" + port + "/appidee/"));
process.on("SIGINT", () => server.close(() => { DB.close(); process.exit(0); }));
