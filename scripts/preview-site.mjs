import { createReadStream, existsSync, statSync } from "node:fs";
import { createServer } from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..", existsSync(path.join(__dirname, "..", "dist")) ? "dist" : ".");
const port = Number(process.env.PORT || 4170);

const types = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".pdf": "application/pdf",
  ".xml": "application/xml; charset=utf-8",
  ".txt": "text/plain; charset=utf-8"
};

function resolveRequest(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const safePath = path.normalize(decoded).replace(/^(\.\.[/\\])+/, "");
  let filePath = path.join(root, safePath);

  if (existsSync(filePath) && statSync(filePath).isDirectory()) {
    filePath = path.join(filePath, "index.html");
  }

  if (!existsSync(filePath) && !path.extname(filePath)) {
    filePath = path.join(root, safePath, "index.html");
  }

  let found = existsSync(filePath);
  if (!found) {
    filePath = path.join(root, "404.html");
    found = false;
  }

  return { filePath, found };
}

createServer((request, response) => {
  const { filePath, found } = resolveRequest(request.url || "/");
  const type = types[path.extname(filePath).toLowerCase()] || "application/octet-stream";
  response.writeHead(found ? 200 : 404, { "Content-Type": type });
  createReadStream(filePath).pipe(response);
}).listen(port, () => {
  console.log(`Previewing ${root} at http://localhost:${port}`);
});
