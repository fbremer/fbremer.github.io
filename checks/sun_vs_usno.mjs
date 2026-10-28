// Compare hilo-sunrise-drift.html's sunrise and sunset with the US Naval Observatory for Hilo,
// and print the analemma's crossing and Lāhainā Noon dates from hilo-analemma.html.
// Usage: node checks/sun_vs_usno.mjs
import fs from 'fs';
const read = f => fs.readFileSync(new URL('../' + f, import.meta.url), 'utf8');
const sr = read('hilo-sunrise-drift.html');
const L = new Function(sr.slice(sr.indexOf('const D2R'), sr.indexOf('let C={}')) + sr.slice(sr.indexOf('function sun('), sr.indexOf('const dstr')) + '; return {S, fmt};')();
const day = n => new Date(Date.UTC(2026, 0, n)).toISOString().slice(0, 10);
const hm = m => { m = Math.round(m); return String(Math.floor(m / 60)).padStart(2, '0') + ':' + String(m % 60).padStart(2, '0'); };
const ext = (k, cmp) => { let b = 0; L.S.forEach((s, i) => { if (cmp(s[k], L.S[b][k])) b = i; }); return b + 1; };
const days = [ext('rise', (a, b) => a > b), ext('rise', (a, b) => a < b), ext('set', (a, b) => a < b), ext('set', (a, b) => a > b), 100, 172, 250, 355];
let worst = 0;
for (const n of days) {
  const r = await (await fetch(`https://aa.usno.navy.mil/api/rstt/oneday?date=${day(n)}&coords=19.72,-155.08&tz=-10`)).json();
  const u = Object.fromEntries(r.properties.data.sundata.map(x => [x.phen, x.time]));
  const toMin = t => { const [h, m] = t.split(':').map(Number); return h * 60 + m; };
  const dr = Math.round(L.S[n - 1].rise) - toMin(u.Rise), ds = Math.round(L.S[n - 1].set) - toMin(u.Set);
  worst = Math.max(worst, Math.abs(dr), Math.abs(ds));
  console.log(`${day(n)}  rise ${hm(L.S[n - 1].rise)} vs USNO ${u.Rise} (${dr >= 0 ? '+' : ''}${dr})  set ${hm(L.S[n - 1].set)} vs USNO ${u.Set} (${ds >= 0 ? '+' : ''}${ds})`);
}
console.log(`largest difference: ${worst} min`);
const an = read('hilo-analemma.html');
const A = new Function(an.slice(an.indexOf('const D2R'), an.indexOf('let C={}')) + an.slice(an.indexOf('const UTC_NOON'), an.indexOf('const dstr')) + '; return {S, zen};')();
console.log('Lāhainā Noon in Hilo:', A.zen.map(day).join(' and '));
const pts = A.S.map(s => [s.both * 0.25 * Math.cos(s.dec * Math.PI / 180), s.dec]);
let best = null; for (let i = 0; i < 365; i++) for (let j = i + 30; j < Math.min(365, i + 335); j++) { const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (!best || d < best[0]) best = [d, i + 1, j + 1]; }
console.log('figure-8 crossing:', day(best[1]), 'and', day(best[2]));
