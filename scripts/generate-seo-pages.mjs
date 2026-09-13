import fs from 'node:fs/promises'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { loadProjectData } from './load-project-data.mjs'

const SCRIPT_DIRECTORY = path.dirname(fileURLToPath(import.meta.url))
const REPOSITORY_ROOT = path.resolve(SCRIPT_DIRECTORY, '..')
const DIST_DIRECTORY = path.join(REPOSITORY_ROOT, 'dist')
const TEMPLATE_PATH = path.join(DIST_DIRECTORY, 'index.html')
const SEO_DATA_PATH = path.join(REPOSITORY_ROOT, 'src', 'seoData.json')

const HEAD_START = '<!-- SEO_ROUTE_START -->'
const HEAD_END = '<!-- SEO_ROUTE_END -->'
const FALLBACK_START = '<!-- SEO_FALLBACK_START -->'
const FALLBACK_END = '<!-- SEO_FALLBACK_END -->'

const escapeHtml = (value = '') =>
  String(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#39;')

const escapeXml = escapeHtml

const safeJson = (value) => JSON.stringify(value, null, 2).replaceAll('<', '\\u003c')

const absoluteUrl = (site, pathname) => new URL(pathname, `${site.baseUrl}/`).href

const replaceBetweenMarkers = (source, startMarker, endMarker, replacement, label) => {
  const start = source.indexOf(startMarker)
  const end = source.indexOf(endMarker)

  if (start === -1 || end === -1 || end < start) {
    throw new Error(
      `No se encontraron los marcadores ${startMarker} y ${endMarker} en dist/index.html (${label}).`,
    )
  }

  const contentStart = start + startMarker.length
  return `${source.slice(0, contentStart)}\n${replacement.trim()}\n${source.slice(end)}`
}

const renderBreadcrumbs = (site, items) => {
  if (items.length < 2) return ''

  return `<nav aria-label="Migas de pan">
  <ol>
    ${items
      .map((item, index) => {
        const name = escapeHtml(item.name)
        return `<li>${
          index === items.length - 1
            ? `<span aria-current="page">${name}</span>`
            : `<a href="${escapeHtml(item.path)}">${name}</a>`
        }</li>`
      })
      .join('\n    ')}
  </ol>
</nav>`
}

const renderSiteNavigation = (site) => `<header>
  <a href="/" aria-label="Tellounder, inicio">${escapeHtml(site.name)}</a>
  <nav aria-label="Navegación SEO principal">
    <a href="/servicios">Servicios</a>
    <a href="/servicios/ia-rag">IA y RAG</a>
    <a href="/metodo">Método</a>
    <a href="/sobre-leonardo-tello">Leonardo Tello</a>
    <a href="/contacto">Contacto</a>
  </nav>
</header>`

const renderContactFooter = (site) => `<footer>
  <p>${escapeHtml(site.name)} / ${escapeHtml(site.personName)}</p>
  <nav aria-label="Perfiles y contacto">
    <a href="${escapeHtml(site.profiles.whatsapp)}">WhatsApp</a>
    <a href="${escapeHtml(site.profiles.instagram)}">Instagram</a>
    <a href="${escapeHtml(site.profiles.linkedin)}">LinkedIn</a>
    <a href="${escapeHtml(site.profiles.github)}">GitHub</a>
  </nav>
</footer>`

const renderSections = (sections = []) =>
  sections
    .map(
      (section, index) => `<section aria-labelledby="section-${index + 1}">
  <h2 id="section-${index + 1}">${escapeHtml(section.title)}</h2>
  ${section.body.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join('\n  ')}
</section>`,
    )
    .join('\n')

const renderServices = (services, title = 'Servicios de Tellounder') => `<section aria-labelledby="services-title">
  <h2 id="services-title">${escapeHtml(title)}</h2>
  ${services
    .map(
      (service) => `<article id="${escapeHtml(service.id)}">
    <h3><a href="${escapeHtml(service.href)}">${escapeHtml(service.title)}</a></h3>
    <p>${escapeHtml(service.summary)}</p>
    <p>${escapeHtml(service.detail)}</p>
  </article>`,
    )
    .join('\n  ')}
</section>`

const renderProjectDirectory = (seoProjects, projectData) => `<section id="proyectos" aria-labelledby="projects-title">
  <h2 id="projects-title">Proyectos y casos de estudio</h2>
  ${projectData
    .map((project) => {
      const seo = seoProjects[project.id]
      return `<article>
    <h3><a href="${escapeHtml(seo.path)}">${escapeHtml(project.title)}</a></h3>
    <p>${escapeHtml(project.statement)}</p>
    <p>${escapeHtml(project.role)}</p>
  </article>`
    })
    .join('\n  ')}
</section>`

const renderPageFallback = ({ site, page, seoProjects, projectData, services }) => {
  const breadcrumbs = [
    { name: 'Inicio', path: '/' },
    ...(page.path === '/' ? [] : [{ name: page.h1, path: page.path }]),
  ]
  const isServiceIndex = page.type === 'services'
  const isAiService = page.id === 'rag'

  return `${renderSiteNavigation(site)}
<main class="seo-fallback" data-seo-route="${escapeHtml(page.id)}">
  ${renderBreadcrumbs(site, breadcrumbs)}
  <p>${escapeHtml(page.eyebrow)}</p>
  <h1>${escapeHtml(page.h1)}</h1>
  <p>${escapeHtml(page.lead)}</p>
  ${renderSections(page.sections)}
  ${isServiceIndex ? renderServices(services) : ''}
  ${isAiService ? renderServices(services.filter((service) => service.id === 'ia-rag'), 'Servicio de IA aplicada') : ''}
  ${page.id === 'home' ? renderServices(services) : ''}
  ${page.id === 'home' || isServiceIndex ? renderProjectDirectory(seoProjects, projectData) : ''}
  ${
    page.type === 'contact'
      ? `<section aria-labelledby="contact-options">
    <h2 id="contact-options">Contactar a Leonardo Tello</h2>
    <p><a href="${escapeHtml(site.profiles.whatsapp)}">Escribir por WhatsApp al ${escapeHtml(site.phone)}</a></p>
    <p><a href="${escapeHtml(site.profiles.instagram)}">Ver @tellounder en Instagram</a></p>
    <p><a href="${escapeHtml(site.profiles.linkedin)}">Ver perfil profesional en LinkedIn</a></p>
    <p><a href="${escapeHtml(site.profiles.github)}">Ver proyectos públicos de tellounder en GitHub</a></p>
  </section>`
      : ''
  }
</main>
${renderContactFooter(site)}`
}

const renderTechList = (tech) => `<ul>
  ${tech
    .map(
      (item) => `<li><strong>${escapeHtml(item.name)}</strong>: ${escapeHtml(item.use)}</li>`,
    )
    .join('\n  ')}
</ul>`

const renderProjectFallback = ({ site, project, seo, seoProjects, projectData }) => {
  const shareMessage = `${seo.shareText}\n\n${project.statement}\nAlcance: ${project.role}\n${absoluteUrl(site, seo.path)}`
  const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(shareMessage)}`

  return `${renderSiteNavigation(site)}
<main class="seo-fallback" data-seo-route="project-${escapeHtml(project.id)}">
  ${renderBreadcrumbs(site, [
    { name: 'Inicio', path: '/' },
    { name: 'Proyectos', path: '/#proyectos' },
    { name: project.title, path: seo.path },
  ])}
  <p>${escapeHtml(project.type)}</p>
  <h1>${escapeHtml(seo.h1)}</h1>
  <p>${escapeHtml(project.statement)}</p>
  <p>${escapeHtml(project.role)}</p>
  <p><a href="${escapeHtml(project.url)}">Abrir ${escapeHtml(project.title)} en vivo</a></p>
  ${project.repository ? `<p><a href="${escapeHtml(project.repository)}">Ver el código del proyecto en GitHub</a></p>` : ''}
  <p><a href="${escapeHtml(whatsappUrl)}">Compartir este caso por WhatsApp</a></p>
  <section aria-labelledby="project-stack">
    <h2 id="project-stack">Tecnologías y funciones del proyecto</h2>
    ${renderTechList(project.stack)}
  </section>
  <section aria-labelledby="project-tracks">
    <h2 id="project-tracks">Necesidades, decisiones y resultados</h2>
    ${project.tracks
      .map(
        (track, index) => `<article id="track-${index + 1}">
      <p>${escapeHtml(track.chapter)}</p>
      <h3>${escapeHtml(track.title)}</h3>
      <p>${escapeHtml(track.summary)}</p>
      <dl>
        <dt>Necesidad</dt>
        <dd>${escapeHtml(track.signal)}</dd>
        <dt>Decisión de producto</dt>
        <dd>${escapeHtml(track.decision)}</dd>
        <dt>Resultado</dt>
        <dd>${escapeHtml(track.result)}</dd>
        <dt>Evidencia</dt>
        <dd>${escapeHtml(track.proof)}</dd>
      </dl>
      ${track.evidenceUrl ? `<p><a href="${escapeHtml(track.evidenceUrl)}">Ver implementación y evidencia</a></p>` : ''}
      <h4>Tecnologías aplicadas en este track</h4>
      ${renderTechList(track.tech)}
    </article>`,
      )
      .join('\n    ')}
  </section>
  ${renderProjectDirectory(seoProjects, projectData.filter((item) => item.id !== project.id))}
</main>
${renderContactFooter(site)}`
}

const breadcrumbSchema = (site, items) => ({
  '@type': 'BreadcrumbList',
  '@id': `${absoluteUrl(site, items.at(-1).path)}#breadcrumb`,
  itemListElement: items.map((item, index) => ({
    '@type': 'ListItem',
    position: index + 1,
    name: item.name,
    item: absoluteUrl(site, item.path),
  })),
})

const baseEntities = (site) => {
  const home = absoluteUrl(site, '/')
  const personId = `${home}#leonardo-tello`
  const organizationId = `${home}#organization`
  const websiteId = `${home}#website`
  const sameAs = [site.profiles.linkedin, site.profiles.instagram, site.profiles.github]

  return {
    personId,
    organizationId,
    websiteId,
    person: {
      '@type': 'Person',
      '@id': personId,
      name: site.personName,
      alternateName: site.name,
      url: absoluteUrl(site, '/sobre-leonardo-tello'),
      sameAs,
      worksFor: { '@id': organizationId },
      jobTitle: 'Digital Product Builder',
      knowsAbout: [
        'Producto digital',
        'Diseño UX',
        'Desarrollo frontend',
        'Desarrollo backend',
        'Arquitectura de sistemas',
        'Automatización',
        'Inteligencia artificial aplicada',
        'Generación aumentada por recuperación (RAG)',
      ],
    },
    organization: {
      '@type': 'Organization',
      '@id': organizationId,
      name: site.name,
      url: home,
      founder: { '@id': personId },
      sameAs,
      contactPoint: {
        '@type': 'ContactPoint',
        telephone: site.phone,
        url: site.profiles.whatsapp,
        contactType: 'consultas profesionales',
        availableLanguage: ['es'],
      },
    },
    website: {
      '@type': 'WebSite',
      '@id': websiteId,
      url: home,
      name: site.name,
      inLanguage: site.language,
      publisher: { '@id': organizationId },
      author: { '@id': personId },
    },
  }
}

const buildPageSchema = ({ site, page, services }) => {
  const entities = baseEntities(site)
  const url = absoluteUrl(site, page.path)
  const image = absoluteUrl(site, page.ogImage)
  const breadcrumbs = [
    { name: 'Inicio', path: '/' },
    ...(page.path === '/' ? [] : [{ name: page.h1, path: page.path }]),
  ]
  const pageType = page.type === 'profile' ? 'ProfilePage' : page.type === 'contact' ? 'ContactPage' : 'WebPage'
  const webPage = {
    '@type': pageType,
    '@id': `${url}#webpage`,
    url,
    name: page.title,
    headline: page.h1,
    description: page.description,
    inLanguage: site.language,
    isPartOf: { '@id': entities.websiteId },
    about: page.type === 'profile' ? { '@id': entities.personId } : { '@id': entities.organizationId },
    primaryImageOfPage: {
      '@type': 'ImageObject',
      url: image,
      width: 1200,
      height: 630,
      caption: page.ogAlt,
    },
    breadcrumb: breadcrumbs.length > 1 ? { '@id': `${url}#breadcrumb` } : undefined,
  }

  if (page.type === 'profile') webPage.mainEntity = { '@id': entities.personId }
  if (page.type === 'contact') webPage.mainEntity = { '@id': entities.organizationId }

  const graph = [entities.website, entities.person, entities.organization, webPage]

  if (breadcrumbs.length > 1) graph.push(breadcrumbSchema(site, breadcrumbs))

  if (page.type === 'services') {
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: 'Diseño y desarrollo de productos digitales y sistemas',
      description: page.description,
      url,
      provider: { '@id': entities.organizationId },
      hasOfferCatalog: {
        '@type': 'OfferCatalog',
        name: 'Servicios Tellounder',
        itemListElement: services.map((service) => ({
          '@type': 'Offer',
          itemOffered: {
            '@type': 'Service',
            name: service.title,
            description: service.detail,
            url: absoluteUrl(site, service.href),
          },
        })),
      },
    })
  }

  if (page.id === 'rag') {
    const service = services.find((item) => item.id === 'ia-rag')
    graph.push({
      '@type': 'Service',
      '@id': `${url}#service`,
      name: service.title,
      serviceType: 'Diseño de IA aplicada, asistentes y bots RAG',
      description: service.detail,
      url,
      provider: { '@id': entities.organizationId },
    })
  }

  return { '@context': 'https://schema.org', '@graph': graph }
}

const buildProjectSchema = ({ site, project, seo }) => {
  const entities = baseEntities(site)
  const url = absoluteUrl(site, seo.path)
  const image = absoluteUrl(site, seo.ogImage)
  const breadcrumbs = [
    { name: 'Inicio', path: '/' },
    { name: 'Proyectos', path: '/#proyectos' },
    { name: project.title, path: seo.path },
  ]
  const creativeWorkId = `${url}#case-study`

  return {
    '@context': 'https://schema.org',
    '@graph': [
      entities.website,
      entities.person,
      entities.organization,
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: seo.title,
        headline: seo.h1,
        description: seo.description,
        inLanguage: site.language,
        isPartOf: { '@id': entities.websiteId },
        mainEntity: { '@id': creativeWorkId },
        primaryImageOfPage: {
          '@type': 'ImageObject',
          url: image,
          width: 1200,
          height: 630,
          caption: seo.ogAlt,
        },
        breadcrumb: { '@id': `${url}#breadcrumb` },
      },
      {
        '@type': 'CreativeWork',
        '@id': creativeWorkId,
        url,
        name: project.title,
        headline: seo.h1,
        description: seo.description,
        image,
        inLanguage: site.language,
        creator: { '@id': entities.personId },
        publisher: { '@id': entities.organizationId },
        about: seo.topics.map((name) => ({ '@type': 'Thing', name })),
        sameAs: project.url,
        mainEntityOfPage: { '@id': `${url}#webpage` },
      },
      breadcrumbSchema(site, breadcrumbs),
    ],
  }
}

const renderHead = ({ site, route, schema, robots = 'index,follow,max-image-preview:large,max-snippet:-1,max-video-preview:-1' }) => {
  const canonical = absoluteUrl(site, route.path)
  const image = absoluteUrl(site, route.ogImage)
  const ogType = route.type === 'project' ? 'article' : 'website'

  return `<title>${escapeHtml(route.title)}</title>
<meta name="description" content="${escapeHtml(route.description)}" />
<meta name="author" content="${escapeHtml(site.personName)}" />
<meta name="application-name" content="${escapeHtml(site.name)}" />
<meta name="robots" content="${escapeHtml(robots)}" />
<link rel="canonical" href="${escapeHtml(canonical)}" />
<meta property="og:locale" content="${escapeHtml(site.locale)}" />
<meta property="og:site_name" content="${escapeHtml(site.name)}" />
<meta property="og:type" content="${escapeHtml(ogType)}" />
<meta property="og:title" content="${escapeHtml(route.title)}" />
<meta property="og:description" content="${escapeHtml(route.description)}" />
<meta property="og:url" content="${escapeHtml(canonical)}" />
<meta property="og:image" content="${escapeHtml(image)}" />
<meta property="og:image:secure_url" content="${escapeHtml(image)}" />
<meta property="og:image:type" content="image/png" />
<meta property="og:image:width" content="1200" />
<meta property="og:image:height" content="630" />
<meta property="og:image:alt" content="${escapeHtml(route.ogAlt)}" />
<meta name="twitter:card" content="summary_large_image" />
<meta name="twitter:title" content="${escapeHtml(route.title)}" />
<meta name="twitter:description" content="${escapeHtml(route.description)}" />
<meta name="twitter:image" content="${escapeHtml(image)}" />
<meta name="twitter:image:alt" content="${escapeHtml(route.ogAlt)}" />
<script type="application/ld+json">${safeJson(schema)}</script>`
}

const routeOutputPath = (pathname) =>
  pathname === '/'
    ? path.join(DIST_DIRECTORY, 'index.html')
    : path.join(DIST_DIRECTORY, pathname.replace(/^\/+|\/+$/g, ''), 'index.html')

const writeRoute = async ({ template, site, route, schema, fallback }) => {
  let output = replaceBetweenMarkers(template, HEAD_START, HEAD_END, renderHead({ site, route, schema }), 'head')
  output = replaceBetweenMarkers(output, FALLBACK_START, FALLBACK_END, fallback, 'fallback')
  const destination = routeOutputPath(route.path)
  await fs.mkdir(path.dirname(destination), { recursive: true })
  await fs.writeFile(destination, output, 'utf8')
  return destination
}

const validateConfiguration = ({ seoData, projectData }) => {
  const { site, pages, projects, services } = seoData
  if (!site?.baseUrl || !Array.isArray(pages) || !projects || !Array.isArray(services)) {
    throw new Error('src/seoData.json no cumple el contrato site/pages/projects/services.')
  }

  const ids = new Set()
  const paths = new Set()
  for (const route of [...pages, ...Object.values(projects)]) {
    if (!route.path?.startsWith('/')) throw new Error(`Ruta SEO inválida: ${route.path}`)
    if (paths.has(route.path)) throw new Error(`Ruta SEO duplicada: ${route.path}`)
    if (!route.title || !route.description || !route.h1 || !route.ogImage || !route.ogAlt) {
      throw new Error(`Metadata SEO incompleta en la ruta ${route.path}.`)
    }
    paths.add(route.path)
  }

  for (const page of pages) {
    if (ids.has(page.id)) throw new Error(`ID de página SEO duplicado: ${page.id}`)
    ids.add(page.id)
  }

  const projectIds = new Set(projectData.map((project) => project.id))
  for (const project of projectData) {
    if (!projects[project.id]) throw new Error(`Falta configuración SEO para el proyecto "${project.id}".`)
    if (!Array.isArray(project.tracks) || project.tracks.length === 0) {
      throw new Error(`El proyecto "${project.id}" no tiene tracks para la página estática.`)
    }
  }
  for (const projectId of Object.keys(projects)) {
    if (!projectIds.has(projectId)) {
      throw new Error(`La configuración SEO contiene un proyecto inexistente: "${projectId}".`)
    }
  }
}

const validateOgImages = async ({ site, pages, projects }) => {
  const images = new Set([...pages.map((page) => page.ogImage), ...Object.values(projects).map((project) => project.ogImage)])
  const problems = []
  const pngSignature = '89504e470d0a1a0a'

  for (const image of images) {
    if (!image.startsWith('/')) {
      problems.push(`${image} (la ruta debe comenzar con /)`)
      continue
    }
    const localPath = path.join(DIST_DIRECTORY, image.replace(/^\/+/, ''))
    try {
      const stat = await fs.stat(localPath)
      if (!stat.isFile()) {
        problems.push(`${image} (no es un archivo)`)
        continue
      }
      const content = await fs.readFile(localPath)
      const signature = content.subarray(0, 8).toString('hex')
      if (content.length < 24 || signature !== pngSignature) {
        problems.push(`${image} (debe ser un PNG válido)`)
        continue
      }
      const width = content.readUInt32BE(16)
      const height = content.readUInt32BE(20)
      if (width !== 1200 || height !== 630) {
        problems.push(`${image} (mide ${width}x${height}; debe medir 1200x630)`)
      }
    } catch {
      problems.push(`${image} (no existe)`)
    }
  }

  if (problems.length > 0) {
    throw new Error(
      `Las imágenes Open Graph de dist están incompletas o no cumplen el formato requerido:\n- ${problems.join('\n- ')}\nGenerá o copiá PNG de 1200x630 antes de ejecutar el generador SEO. Base pública esperada: ${site.baseUrl}`,
    )
  }
}

const renderSitemap = ({ site, pages, projects }) => {
  const routes = [...pages, ...Object.values(projects)]
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
${routes
  .map(
    (route) => `  <url>
    <loc>${escapeXml(absoluteUrl(site, route.path))}</loc>
    <image:image>
      <image:loc>${escapeXml(absoluteUrl(site, route.ogImage))}</image:loc>
      <image:title>${escapeXml(route.ogAlt)}</image:title>
    </image:image>
  </url>`,
  )
  .join('\n')}
</urlset>
`
}

const render404 = ({ template, site }) => {
  const route = {
    path: '/404.html',
    type: 'error',
    title: `Página no encontrada | ${site.name}`,
    description: 'La dirección solicitada no existe. Volvé al inicio de Tellounder para recorrer servicios y proyectos.',
    h1: 'Página no encontrada',
    ogImage: '/og/tellounder.png',
    ogAlt: 'Tellounder sobre fondo negro',
  }
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: route.title,
    url: absoluteUrl(site, '/404.html'),
    isPartOf: { '@id': `${absoluteUrl(site, '/')}#website` },
  }
  const fallback = `${renderSiteNavigation(site)}
<main class="seo-fallback" data-seo-route="404">
  <h1>${escapeHtml(route.h1)}</h1>
  <p>${escapeHtml(route.description)}</p>
  <p><a href="/">Volver al inicio</a></p>
</main>
${renderContactFooter(site)}`
  let output = replaceBetweenMarkers(
    template,
    HEAD_START,
    HEAD_END,
    renderHead({ site, route, schema, robots: 'noindex,follow' }),
    'head',
  )
  output = replaceBetweenMarkers(output, FALLBACK_START, FALLBACK_END, fallback, 'fallback')
  return output.replace(/\s*<script\s+type="module"[^>]*>\s*<\/script>/i, '')
}

async function main() {
  const [template, seoSource, projectData] = await Promise.all([
    fs.readFile(TEMPLATE_PATH, 'utf8'),
    fs.readFile(SEO_DATA_PATH, 'utf8'),
    loadProjectData(),
  ])
  const seoData = JSON.parse(seoSource)
  validateConfiguration({ seoData, projectData })
  await validateOgImages(seoData)

  const { site, pages, projects: seoProjects, services } = seoData
  const written = []

  for (const page of pages) {
    written.push(
      await writeRoute({
        template,
        site,
        route: page,
        schema: buildPageSchema({ site, page, services }),
        fallback: renderPageFallback({ site, page, seoProjects, projectData, services }),
      }),
    )
  }

  for (const project of projectData) {
    const seo = { ...seoProjects[project.id], type: 'project' }
    written.push(
      await writeRoute({
        template,
        site,
        route: seo,
        schema: buildProjectSchema({ site, project, seo }),
        fallback: renderProjectFallback({ site, project, seo, seoProjects, projectData }),
      }),
    )
  }

  await Promise.all([
    fs.writeFile(
      path.join(DIST_DIRECTORY, 'sitemap.xml'),
      renderSitemap({ site, pages, projects: seoProjects }),
      'utf8',
    ),
    fs.writeFile(
      path.join(DIST_DIRECTORY, 'robots.txt'),
      `User-agent: *\nAllow: /\n\nSitemap: ${absoluteUrl(site, '/sitemap.xml')}\n`,
      'utf8',
    ),
    fs.writeFile(path.join(DIST_DIRECTORY, '404.html'), render404({ template, site }), 'utf8'),
  ])

  console.log(
    `SEO estático generado: ${written.length} rutas, sitemap.xml, robots.txt y 404.html.`,
  )
}

main().catch((error) => {
  console.error(`[seo] ${error instanceof Error ? error.message : String(error)}`)
  process.exitCode = 1
})
