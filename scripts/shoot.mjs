// Screenshot + console-error capture using the locally installed Chrome (no browser download).
// Usage: node scripts/shoot.mjs <url-path> <out.png> [width] [height] [--full] [--scroll=px] [--wait=ms] [--reduced]
import { chromium } from 'playwright-core';

const [path = '/', out = 'shot.png', w = '1440', h = '900', ...flags] = process.argv.slice(2);
const base = process.env.BASE_URL || 'http://localhost:5173';
const flag = (name) => flags.find((f) => f.startsWith(`--${name}`));
const value = (name, d) => (flag(name)?.split('=')[1] ?? d);

const browser = await chromium.launch({
  channel: process.env.PW_CHANNEL || 'chrome',
  args: ['--use-angle=d3d11', '--enable-gpu-rasterization', '--ignore-gpu-blocklist'],
});
const context = await browser.newContext({
  viewport: { width: Number(w), height: Number(h) },
  deviceScaleFactor: Number(value('dpr', '1')),
  reducedMotion: flag('reduced') ? 'reduce' : 'no-preference',
});
const page = await context.newPage();
const errors = [];
page.on('console', (m) => {
  if (m.type() === 'error' || m.type() === 'warning') errors.push(`[${m.type()}] ${m.text()}`);
});
page.on('pageerror', (e) => errors.push(`[pageerror] ${e.message}`));

await page.goto(base + path, { waitUntil: 'networkidle' });
await page.waitForTimeout(Number(value('wait', '2500')));
const scroll = Number(value('scroll', '0'));
if (scroll) {
  // Scroll in steps so scroll-linked animations update like a real user.
  for (let y = 0; y <= scroll; y += 120) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(30);
  }
  await page.waitForTimeout(1500);
}
if (flag('full')) {
  // Walk the page so lazy images and in-view reveals load, then return to the top.
  const height = await page.evaluate(() => document.body.scrollHeight);
  for (let y = 0; y < height; y += 400) {
    await page.evaluate((yy) => window.scrollTo(0, yy), y);
    await page.waitForTimeout(80);
  }
  await page.evaluate(() => window.scrollTo(0, 0));
  await page.waitForTimeout(1200);
}
await page.screenshot({ path: out, fullPage: !!flag('full') });
console.log(errors.length ? errors.join('\n') : 'no console errors');
await browser.close();
