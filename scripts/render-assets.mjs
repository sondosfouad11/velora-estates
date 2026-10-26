// Captures the static renders used when WebGL is unavailable and for the "modelled homes" section.
// They are screenshots of the same procedural scenes, so fallbacks always match the live models.
// Requires the Vite dev server (npm run dev). Usage: node scripts/render-assets.mjs
import { chromium } from 'playwright-core';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const base = process.env.BASE_URL || 'http://localhost:5173';
const out = new URL('../public/images/', import.meta.url);
mkdirSync(out, { recursive: true });

const jobs = [
  { view: 'hero', file: 'villa-aurelia-render.jpg', width: 1920, height: 1080 },
  { view: 'aurelia', file: 'model-aurelia.jpg', width: 1200, height: 900 },
  { view: 'lume', file: 'model-lume.jpg', width: 1200, height: 900 },
  { view: 'seren', file: 'model-seren.jpg', width: 1200, height: 900 },
];

const browser = await chromium.launch({ channel: process.env.PW_CHANNEL || 'chrome', args: ['--use-angle=d3d11', '--ignore-gpu-blocklist'] });
for (const job of jobs) {
  const page = await browser.newPage({ viewport: { width: job.width, height: job.height }, deviceScaleFactor: 1, reducedMotion: 'reduce' });
  await page.goto(`${base}/__render/${job.view}`, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas');
  await page.waitForTimeout(3500); // shaders compiled, shadows and environment settled
  await page.screenshot({ path: fileURLToPath(new URL(job.file, out)), type: 'jpeg', quality: 86 });
  console.log('rendered', job.file);
  await page.close();
}
await browser.close();
