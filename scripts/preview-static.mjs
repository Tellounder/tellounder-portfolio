import http from 'node:http'
import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// Serve the generated pages with the same extensionless routing as Hosting.
// Vite's SPA preview otherwise returns the homepage for some project URLs.
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../dist')
const portIndex = process.argv.indexOf('--port')
const port = portIndex < 0 ? 4187 : Number(process.argv[portIndex + 1])
const mime = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.css': 'text/css; charset=utf-8', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp', '.jfif': 'image/jpeg', '.jpg': 'image/jpeg', '.json': 'application/json', '.xml': 'application/xml', '.txt': 'text/plain; charset=utf-8' }

http.createServer(async (request, response) => {
  try {
    if (!['GET', 'HEAD'].includes(request.method)) { response.writeHead(405); response.end(); return }
    const pathname = decodeURIComponent(new URL(request.url, 'http://localhost').pathname)
    let filename = path.resolve(root, '.' + pathname)
    const relative = path.relative(root, filename)
    if (relative.startsWith('..') || path.isAbsolute(relative)) { response.writeHead(403); response.end(); return }
    let status = 200
    try {
      if ((await fs.stat(filename)).isDirectory()) filename = path.join(filename, 'index.html')
      await fs.access(filename)
    } catch { filename = path.join(root, '404.html'); status = 404 }
    const data = await fs.readFile(filename)
    response.writeHead(status, { 'Content-Type': mime[path.extname(filename).toLowerCase()] ?? 'application/octet-stream', 'Cache-Control': 'no-cache', 'Content-Length': data.length })
    response.end(request.method === 'HEAD' ? undefined : data)
  } catch { response.writeHead(400); response.end('Bad request') }
}).listen(port, '127.0.0.1', () => console.log(`Tellounder preview: http://127.0.0.1:${port}`))
