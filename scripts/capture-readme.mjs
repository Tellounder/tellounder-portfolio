import { chromium } from '@playwright/test'
import { mkdir } from 'node:fs/promises'

// Capture only the public portfolio UI. No authentication or private data.
const base = process.argv[2] ?? 'http://127.0.0.1:4190'
await mkdir('.github/assets', { recursive: true })
const browser = await chromium.launch({ channel: 'chrome' })
try {
  const page = await browser.newPage({ viewport: { width: 1440, height: 1000 }, reducedMotion: 'reduce' })
  await page.goto(`${base}/proyectos/avvivo`)
  await page.waitForSelector('.album-sleeve')
  await page.locator('.sleeve-vector').evaluate((img) => img.decode())
  await page.locator('.work-scene').screenshot({ path: '.github/assets/portfolio.jpg', type: 'jpeg', quality: 85, style: '.topbar,.statusbar{visibility:hidden}' })
  console.log('README cover captured from the public portfolio interface.')
} finally { await browser.close() }
