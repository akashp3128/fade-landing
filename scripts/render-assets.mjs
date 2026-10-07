/**
 * Regenerates the raster brand placeholders in /public from SVG/HTML sources:
 *   favicon-32.png, apple-touch-icon.png, icon-192.png, icon-512.png, og-image.png
 *
 * Not part of the normal build. Requires `playwright-core` and a local Chrome/Chromium:
 *   npm i --no-save playwright-core && CHROME_PATH=/usr/bin/google-chrome node scripts/render-assets.mjs
 * Replace with official assets from Fade Design when available.
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const { chromium } = await import(process.env.PLAYWRIGHT_CORE || 'playwright-core');
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const pub = (f) => path.join(root, 'public', f);
// Inline fonts as data URLs (file:// URLs are blocked from about:blank pages).
const font = (p) => `data:font/woff2;base64,${readFileSync(path.join(root, 'node_modules', p)).toString('base64')}`;

const browser = await chromium.launch({ executablePath: process.env.CHROME_PATH || '/usr/bin/google-chrome' });
const page = await browser.newPage();

const svg = readFileSync(pub('favicon.svg'), 'utf8');
for (const [file, size] of [['favicon-32.png', 32], ['apple-touch-icon.png', 180], ['icon-192.png', 192], ['icon-512.png', 512]]) {
  await page.setViewportSize({ width: size, height: size });
  // apple-touch-icon should be full-bleed (iOS applies its own mask)
  const body = file === 'apple-touch-icon.png' ? svg.replace('rx="8"', 'rx="0"') : svg;
  await page.setContent(`<html><body style="margin:0;background:transparent">${body.replace('<svg ', `<svg width="${size}" height="${size}" `)}</body></html>`);
  writeFileSync(pub(file), await page.screenshot({ omitBackground: true }));
}

await page.setViewportSize({ width: 1200, height: 630 });
await page.setContent(`<!doctype html><html><head><style>
@font-face{font-family:Inter;src:url(${font('@fontsource-variable/inter/files/inter-latin-wght-normal.woff2')}) format('woff2');font-weight:100 900}
@font-face{font-family:Playfair;src:url(${font('@fontsource/playfair-display/files/playfair-display-latin-600-normal.woff2')}) format('woff2');font-weight:600}
*{box-sizing:border-box}html,body{margin:0}
body{width:1200px;height:630px;background:#0b0b0c;color:#f5f5f4;font-family:Inter,sans-serif;position:relative;overflow:hidden}
.glow{position:absolute;inset:0;background:radial-gradient(55% 75% at 85% 10%,rgba(212,175,55,.22),transparent 70%)}
.wrap{position:absolute;inset:0;padding:80px 88px;display:flex;flex-direction:column;justify-content:space-between}
.brand{display:flex;align-items:center;gap:18px;font-family:Playfair,serif;font-size:44px;font-weight:600}
h1{font-family:Playfair,serif;font-weight:600;font-size:76px;line-height:1.05;margin:0;letter-spacing:-.01em}
h1 span{color:#d4af37}
p{margin:22px 0 0;font-size:30px;color:#a8a8b0}
.pill{display:inline-flex;align-items:center;gap:12px;font-size:24px;color:#a8a8b0;border:1px solid #2a2a2f;border-radius:999px;padding:10px 22px;background:#141416}
.dot{width:10px;height:10px;border-radius:50%;background:#d4af37}
</style></head><body><div class="glow"></div><div class="wrap">
<div class="brand">${svg.replace('<svg ', '<svg width="60" height="60" ')}Fade</div>
<div><h1>Your chair. Your bookings.<br><span>Your payouts.</span></h1>
<p>Booking and payments for independent barbers.</p></div>
<div><span class="pill"><span class="dot"></span>Launching first in Chicago</span></div>
</div></body></html>`);
await page.evaluate(async () => { await document.fonts.load('600 76px Playfair'); await document.fonts.load('400 30px Inter'); await document.fonts.ready; });
writeFileSync(pub('og-image.png'), await page.screenshot());

await browser.close();
console.log('assets written to public/');
