import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadProjectData } from './load-project-data.mjs'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const dist = path.join(root, 'dist')
const seoData = JSON.parse(await fs.readFile(path.join(root, 'src', 'seoData.json'), 'utf8'))
const projectData = await loadProjectData()
const failures = []

const outputPath = (pathname) => pathname === '/'
  ? path.join(dist, 'index.html')
  : path.join(dist, pathname.replace(/^\/+|\/+$/g, ''), 'index.html')
const absolute = (pathname) => new URL(pathname, `${seoData.site.baseUrl}/`).href
const escapePattern = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
const expect = (condition, message) => { if (!condition) failures.push(message) }

const routes = [
  ...seoData.pages,
  ...projectData.map((project) => ({ ...seoData.projects[project.id], id: project.id, project })),
]

for (const route of routes) {
  const html = await fs.readFile(outputPath(route.path), 'utf8')
  const label = route.path
  expect(html.includes('id="boot-root"') && html.includes('id="app-root"') && html.includes('id="seo-root"'), `${label}: faltan las capas separadas de arranque, aplicación y respaldo.`)
  expect(html.includes('id="boot-style"'), `${label}: falta el estilo crítico de entrada.`)
  const h1Count = (html.match(/<h1(?:\s|>)/gi) ?? []).length
  expect(h1Count === 1, `${label}: debe contener un único H1 estático; contiene ${h1Count}.`)
  expect(html.includes(`<title>${route.title}</title>`), `${label}: title no coincide.`)
  expect(html.includes(`name="description" content="${route.description.replaceAll('&', '&amp;').replaceAll('"', '&quot;')}"`), `${label}: description no coincide.`)
  expect(html.includes(`rel="canonical" href="${absolute(route.path)}"`), `${label}: canonical no coincide.`)
  expect(html.includes(`property="og:url" content="${absolute(route.path)}"`), `${label}: og:url no coincide.`)
  expect(html.includes(`property="og:image" content="${absolute(route.ogImage)}"`), `${label}: og:image no coincide.`)
  expect(html.includes('name="twitter:card" content="summary_large_image"'), `${label}: falta Twitter Card.`)
  expect(!/<meta\s+name=["']keywords["']/i.test(html), `${label}: no debe usar meta keywords.`)

  const jsonLd = [...html.matchAll(/<script\s+type="application\/ld\+json">([\s\S]*?)<\/script>/gi)]
  expect(jsonLd.length === 1, `${label}: debe contener un bloque JSON-LD.`)
  for (const match of jsonLd) {
    try { JSON.parse(match[1]) } catch { failures.push(`${label}: JSON-LD inválido.`) }
  }

  if (route.project) {
    for (const track of route.project.tracks) {
      expect(new RegExp(escapePattern(track.title)).test(html), `${label}: falta el track "${track.title}".`)
    }
  }
}

const sitemap = await fs.readFile(path.join(dist, 'sitemap.xml'), 'utf8')
for (const route of routes) expect(sitemap.includes(`<loc>${absolute(route.path)}</loc>`), `sitemap: falta ${route.path}.`)
expect((sitemap.match(/<url>/g) ?? []).length === routes.length, `sitemap: esperaba ${routes.length} URLs.`)

const robots = await fs.readFile(path.join(dist, 'robots.txt'), 'utf8')
expect(robots.includes(`Sitemap: ${absolute('/sitemap.xml')}`), 'robots.txt: falta el sitemap absoluto.')

const notFound = await fs.readFile(path.join(dist, '404.html'), 'utf8')
expect(notFound.includes('name="robots" content="noindex,follow"'), '404.html: falta noindex,follow.')
expect(!/<script\s+type="module"/i.test(notFound), '404.html: no debe montar la SPA sobre la página de error.')

if (failures.length > 0) {
  console.error(`Validación SEO fallida:\n- ${failures.join('\n- ')}`)
  process.exitCode = 1
} else {
  console.log(`SEO validado: ${routes.length} rutas, ${projectData.reduce((total, project) => total + project.tracks.length, 0)} tracks, sitemap, robots, JSON-LD y 404.`)
}
