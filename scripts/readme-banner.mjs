// Renders docs/readme/banner.png from HTML with the app's own fonts.
// Run after scripts/readme-assets.ts: node scripts/readme-banner.mjs
import { chromium } from '@playwright/test';
import { readFileSync, existsSync, writeFileSync, rmSync } from 'node:fs';
import { resolve } from 'node:path';

const font = (p) => 'file://' + resolve('node_modules/@fontsource', p);
const pattern = readFileSync('docs/readme/.banner-pattern.svg', 'utf8');
const html = `<!doctype html><html><head><meta charset="utf-8"><style>
@font-face{font-family:Syne;font-weight:800;src:url(${font('syne/files/syne-latin-800-normal.woff2')})}
@font-face{font-family:Schibsted;font-weight:500;src:url(${font('schibsted-grotesk/files/schibsted-grotesk-latin-500-normal.woff2')})}
@font-face{font-family:Martian;font-weight:400;src:url(${font('martian-mono/files/martian-mono-latin-400-normal.woff2')})}
*{box-sizing:border-box}body{margin:0;background:#E4E5E1}
.b{width:1600px;height:620px;display:grid;grid-template-columns:760px 1fr;border:1px solid #121212;background:#FBFBFA;color:#121212}
.l{padding:44px 48px 0;display:flex;flex-direction:column;border-right:1px solid #121212;position:relative;overflow:hidden}
.top{display:flex;justify-content:space-between;font:400 13px Martian;letter-spacing:.06em;text-transform:uppercase}
h1{margin:64px 0 0;font:800 134px/0.86 Syne;letter-spacing:-.04em}
.tag{margin:40px 0 0;font:500 44px/1.12 Schibsted;letter-spacing:-.01em}.tag b{font-weight:500;color:#2135F5}
.ruler{position:absolute;left:0;right:0;bottom:0;height:64px;border-top:1px solid #121212;display:flex;align-items:center;justify-content:space-between;padding:0 48px;font:400 12px Martian;letter-spacing:.05em;text-transform:uppercase}
.ticks{position:absolute;left:0;right:0;top:0;height:10px;background-image:repeating-linear-gradient(90deg,#121212 0 1px,transparent 1px 12px),repeating-linear-gradient(90deg,#121212 0 1px,transparent 1px 60px);background-size:100% 6px,100% 10px;background-repeat:no-repeat}
.r{position:relative;padding:28px}
.frame{position:absolute;inset:28px;outline:1px solid #121212;overflow:hidden}
.frame svg{width:100%;height:100%;display:block}
.cm{position:absolute;width:14px;height:14px;border-color:#121212;border-style:solid;border-width:0}
.cap{position:absolute;left:52px;bottom:52px;background:#FBFBFA;border:1px solid #121212;padding:10px 14px;font:400 12px/1.7 Martian;letter-spacing:.05em;text-transform:uppercase}
.knot{position:absolute;right:52px;top:52px;width:64px;height:64px;background:#FBFBFA;border:1px solid #121212;display:flex;align-items:center;justify-content:center}
</style></head><body><div class="b">
<div class="l"><div class="top"><span>Girih · گره · Persian for knot</span><span>v0.1</span></div>
<h1>GIRIH</h1>
<p class="tag">Pure geometry.<br><b>Endless surfaces.</b></p>
<div class="ruler"><div class="ticks"></div><span>Seamless pattern generator</span><span>Runs in your browser</span></div></div>
<div class="r"><span class="cm" style="left:8px;top:8px;border-left-width:1px;border-top-width:1px"></span><span class="cm" style="right:8px;top:8px;border-right-width:1px;border-top-width:1px"></span><span class="cm" style="left:8px;bottom:8px;border-left-width:1px;border-bottom-width:1px"></span><span class="cm" style="right:8px;bottom:8px;border-right-width:1px;border-bottom-width:1px"></span>
<div class="frame">${pattern}</div>
<div class="knot"><svg width="40" height="40" viewBox="0 0 26 26"><rect x="5" y="5" width="16" height="16" fill="none" stroke="#121212" stroke-width="1.6"/><rect x="5" y="5" width="16" height="16" fill="none" stroke="#2135F5" stroke-width="1.6" transform="rotate(45 13 13)"/><circle cx="13" cy="13" r="3" fill="#121212"/></svg></div>
<div class="cap">Plate 471 · p4m · petal<br>Split harmony @ 230° · seed 4471</div></div>
</div></body></html>`;
const tmp = resolve('docs/readme/.banner.html');
writeFileSync(tmp, html);
const exe = existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined;
const browser = await chromium.launch(exe ? { executablePath: exe } : {});
const page = await browser.newPage({
  viewport: { width: 1600, height: 620 },
  deviceScaleFactor: 2,
});
await page.goto('file://' + tmp);
await page.evaluate(() => document.fonts.ready);
await page.waitForTimeout(300);
await page.locator('.b').screenshot({ path: 'docs/readme/banner.png' });
await browser.close();
rmSync(tmp);
console.log('banner written');
