import sharp from 'sharp'
import tracer from 'imagetracerjs'
import { readFile, writeFile, mkdir } from 'node:fs/promises'

// Single-ink print derivatives, not replacement brand masters. Originals stay intact.
const sources = {
  avvivo: ['avvivo.png', 'dark'], aye: ['aye.webp', 'dark'],
  hembra: ['hembra.png', 'dark'], rise: ['rise.png', 'light'],
  anto: ['anto.png', 'light'], metalmente: ['metalmente.svg', 'metal'],
  cielofinal: ['cielofinal.svg', 'dark'],
}
const directory = new URL('../src/assets/sleeve-logos/', import.meta.url)
await mkdir(directory, { recursive: true })
for (const [id, [filename, mode]] of Object.entries(sources)) {
  const input = await readFile(new URL(`../src/assets/project-labels/${filename}`, import.meta.url))
  const { data, info } = await sharp(input).resize(600, 600, { fit: 'inside' }).ensureAlpha().raw().toBuffer({ resolveWithObject: true })
  const pixels = new Uint8ClampedArray(info.width * info.height * 4)
  let left = info.width, top = info.height, right = 0, bottom = 0
  for (let y = 0; y < info.height; y++) for (let x = 0; x < info.width; x++) {
    const p = (y * info.width + x) * 4
    const [r, g, b, a] = data.subarray(p, p + 4)
    const luminance = .2126 * r + .7152 * g + .0722 * b
    const ink = a > 180 && (mode === 'dark' ? luminance < 180 : mode === 'metal' ? luminance > 100 : luminance > 180 || (b > 160 && r < 150))
    if (ink) { pixels.set([255, 255, 255, 255], p); left = Math.min(left, x); right = Math.max(right, x); top = Math.min(top, y); bottom = Math.max(bottom, y) }
  }
  if (right <= left || bottom <= top) throw new Error(`Empty trace: ${id}`)
  const width = right - left + 5, height = bottom - top + 5
  const cropped = new Uint8ClampedArray(width * height * 4)
  for (let y = top; y <= bottom; y++) for (let x = left; x <= right; x++) {
    const p = (y * info.width + x) * 4
    cropped.set(pixels.subarray(p, p + 4), ((y - top + 2) * width + x - left + 2) * 4)
  }
  let svg = tracer.imagedataToSVG({ width, height, data: cropped }, {
    pal: [{ r: 0, g: 0, b: 0, a: 0 }, { r: 255, g: 255, b: 255, a: 255 }],
    colorsampling: 0, colorquantcycles: 1, numberofcolors: 2,
    ltres: .7, qtres: .7, pathomit: 5, roundcoords: 1,
    strokewidth: 0, viewbox: true, desc: false, linefilter: true,
  })
  svg = svg.replace(/<path\b[^>]*opacity="0"[^>]*\/>/g, '')
  if (/<image\b|data:image/.test(svg)) throw new Error('Raster embedding is not vectorization')
  await writeFile(new URL(`${id}.svg`, directory), svg)
  console.log(`${id}: ${width}×${height}, ${Math.round(svg.length / 1024)} KB, vector paths only`)
}

// Seeded physical fibers: static SVG, no animated noise or rendering loop.
let seed = 137
const random = () => ((seed = (seed * 1664525 + 1013904223) >>> 0) / 4294967296)
const fibers = Array.from({ length: 520 }, () => {
  const x = (random() * 180).toFixed(1), y = (random() * 180).toFixed(1)
  return `M${x} ${y}l${(random() * 2.5 + .4).toFixed(1)} ${(random() * 1.6 - .8).toFixed(1)}`
}).join('')
const flecks = Array.from({ length: 180 }, () => `M${(random() * 180).toFixed(1)} ${(random() * 180).toFixed(1)}h${(random() * 1.5 + .3).toFixed(1)}`).join('')
await writeFile(new URL('../src/assets/cardboard-fibers.svg', import.meta.url), `<svg xmlns="http://www.w3.org/2000/svg" width="180" height="180" viewBox="0 0 180 180"><path d="${fibers}" fill="none" stroke="#c8b89a" stroke-opacity=".32" stroke-width=".55"/><path d="${flecks}" fill="none" stroke="#000" stroke-opacity=".6" stroke-width="1"/></svg>`)
