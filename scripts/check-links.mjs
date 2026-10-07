/**
 * Post-build sanity check: every internal href/src in dist/**.html must resolve to a file,
 * taking the configured base path into account. Run after `npm run build`.
 */
import { readFileSync, readdirSync, statSync, existsSync } from 'node:fs';
import path from 'node:path';

const dist = path.resolve('dist');
const base = (process.env.BASE_PATH || '/fade-landing').replace(/\/$/, '');
const files = [];
const walk = (d) => readdirSync(d).forEach((f) => {
  const p = path.join(d, f);
  statSync(p).isDirectory() ? walk(p) : p.endsWith('.html') && files.push(p);
});
walk(dist);

let bad = 0;
for (const file of files) {
  const html = readFileSync(file, 'utf8');
  for (const [, ref] of html.matchAll(/(?:href|src)="([^"]+)"/g)) {
    if (/^(https?:|mailto:|tel:|data:|#)/.test(ref)) continue;
    const clean = ref.split('#')[0].split('?')[0];
    if (!clean.startsWith(`${base}/`) && clean !== base) {
      console.error(`✗ ${path.relative(dist, file)}: "${ref}" is not under base ${base}`); bad++; continue;
    }
    let target = path.join(dist, clean.slice(base.length));
    if (clean.endsWith('/')) target = path.join(target, 'index.html');
    if (!existsSync(target)) { console.error(`✗ ${path.relative(dist, file)}: "${ref}" → missing ${path.relative(dist, target)}`); bad++; }
  }
}
console.log(bad ? `${bad} broken internal link(s)` : `✓ ${files.length} pages, all internal links resolve under ${base}/`);
process.exit(bad ? 1 : 0);
