import seoDataJson from './seoData.json'
import type { ProjectId } from './projectData'

export type SeoScene = 'home' | 'work' | 'services' | 'method' | 'about' | 'contact'

export type SeoPage = {
  id: string
  path: string
  scene: SeoScene
  type: string
  title: string
  description: string
  h1: string
  eyebrow: string
  lead: string
  ogImage: string
  ogAlt: string
  sections?: Array<{ title: string; body: string[] }>
}

export type ProjectSeo = {
  path: string
  title: string
  description: string
  h1: string
  ogImage: string
  ogAlt: string
  shareText: string
  topics: string[]
}

export type ServiceSeo = {
  id: string
  title: string
  summary: string
  detail: string
  href: string
  projectIds: ProjectId[]
}

type SeoData = {
  site: {
    baseUrl: string
    name: string
    legalName: string
    personName: string
    phone: string
    locale: string
    language: string
    profiles: Record<'linkedin' | 'instagram' | 'github' | 'whatsapp', string>
  }
  pages: SeoPage[]
  projects: Record<ProjectId, ProjectSeo>
  services: ServiceSeo[]
}

export const seoData = seoDataJson as SeoData
export const projectSeo = seoData.projects

export type RouteState = {
  id: string
  path: string
  scene: SeoScene
  projectId?: ProjectId
}

const normalizePath = (pathname: string) => {
  const path = pathname.split(/[?#]/, 1)[0].replace(/\/+$/, '')
  return path || '/'
}

export function resolveRoute(pathname: string): RouteState {
  const path = normalizePath(pathname)
  const projectMatch = (Object.entries(projectSeo) as Array<[ProjectId, ProjectSeo]>).find(([, value]) => normalizePath(value.path) === path)
  if (projectMatch) return { id: `project:${projectMatch[0]}`, path: projectMatch[1].path, scene: 'work', projectId: projectMatch[0] }

  const page = seoData.pages.find((item) => normalizePath(item.path) === path)
  if (page) return { id: page.id, path: page.path, scene: page.scene }

  return { id: 'home', path: '/', scene: 'home' }
}

export function routeMeta(route: RouteState) {
  if (route.projectId) return { ...projectSeo[route.projectId], type: 'article' }
  return seoData.pages.find((page) => page.id === route.id) ?? seoData.pages[0]
}

export function absoluteUrl(path: string) {
  return new URL(path, `${seoData.site.baseUrl}/`).toString()
}

function upsertMeta(selector: string, attributes: Record<string, string>) {
  let element = document.head.querySelector<HTMLMetaElement>(selector)
  if (!element) {
    element = document.createElement('meta')
    document.head.appendChild(element)
  }
  Object.entries(attributes).forEach(([name, value]) => element?.setAttribute(name, value))
}

export function syncDocumentMetadata(route: RouteState) {
  const meta = routeMeta(route)
  const canonicalUrl = absoluteUrl(route.path)
  const imageUrl = absoluteUrl(meta.ogImage)
  document.title = meta.title
  upsertMeta('meta[name="description"]', { name: 'description', content: meta.description })
  upsertMeta('meta[property="og:title"]', { property: 'og:title', content: meta.title })
  upsertMeta('meta[property="og:description"]', { property: 'og:description', content: meta.description })
  upsertMeta('meta[property="og:type"]', { property: 'og:type', content: meta.type === 'article' ? 'article' : 'website' })
  upsertMeta('meta[property="og:url"]', { property: 'og:url', content: canonicalUrl })
  upsertMeta('meta[property="og:image"]', { property: 'og:image', content: imageUrl })
  upsertMeta('meta[property="og:image:secure_url"]', { property: 'og:image:secure_url', content: imageUrl })
  upsertMeta('meta[property="og:image:alt"]', { property: 'og:image:alt', content: meta.ogAlt })
  upsertMeta('meta[name="twitter:title"]', { name: 'twitter:title', content: meta.title })
  upsertMeta('meta[name="twitter:description"]', { name: 'twitter:description', content: meta.description })
  upsertMeta('meta[name="twitter:image"]', { name: 'twitter:image', content: imageUrl })
  upsertMeta('meta[name="twitter:image:alt"]', { name: 'twitter:image:alt', content: meta.ogAlt })

  let canonical = document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')
  if (!canonical) {
    canonical = document.createElement('link')
    canonical.rel = 'canonical'
    document.head.appendChild(canonical)
  }
  canonical.href = canonicalUrl
}
