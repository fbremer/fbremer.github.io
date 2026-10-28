// Compare hilo-tides.html's harmonic model with NOAA's official high and low predictions
// for Hilo (station 1617760). Usage: node checks/tides_vs_noaa.mjs [YYYYMMDD start] [YYYYMMDD end]
import fs from 'fs';
const [begin = '20261028', end = '20261127'] = process.argv.slice(2);
const html = fs.readFileSync(new URL('../hilo-tides.html', import.meta.url), 'utf8');
const lib = new Function(html.slice(html.indexOf('const D2R'), html.indexOf('const now=')) + '; return {tideFt, args, D2R};')();
const url = `https://api.tidesandcurrents.noaa.gov/api/prod/datagetter?product=predictions&application=fbremer_explainers&begin_date=${begin}&end_date=${end}&datum=MLLW&station=1617760&time_zone=lst&units=english&interval=hilo&format=json`;
const noaa = (await (await fetch(url)).json()).predictions;
const HST = 10 * 36e5;
const toMs = s => { const [d, t] = s.split(' '); const [Y, M, D] = d.split('-').map(Number); const [h, m] = t.split(':').map(Number); return Date.UTC(Y, M - 1, D, h, m) + HST; };
const t0 = toMs(noaa[0].t) - 864e5, t1 = toMs(noaa[noaa.length - 1].t) + 864e5;
const ser = []; for (let ms = t0; ms <= t1; ms += 6e4) ser.push([ms, lib.tideFt(ms)]);
const ext = []; for (let i = 1; i < ser.length - 1; i++) { const [a, b, c] = [ser[i - 1][1], ser[i][1], ser[i + 1][1]]; if (b > a && b >= c) ext.push([ser[i][0], b, 'H']); else if (b < a && b <= c) ext.push([ser[i][0], b, 'L']); }
const rows = noaa.map((p, i) => {
  const ms = toMs(p.t); let best = null;
  for (const e of ext) if (e[2] === p.type && (!best || Math.abs(e[0] - ms) < Math.abs(best[0] - ms))) best = e;
  const nb = [noaa[i - 1], noaa[i + 1]].filter(Boolean).map(q => Math.abs(Number(p.v) - Number(q.v)));
  return { minutes: Math.abs(best[0] - ms) / 6e4, inches: Math.abs(best[1] - Number(p.v)) * 12, turn: Math.min(...nb) };
});
const q = (a, f) => { const s = [...a].sort((x, y) => x - y); return s[Math.min(s.length - 1, Math.floor(s.length * f))]; };
const m = rows.map(r => r.minutes), h = rows.map(r => r.inches);
console.log(`${rows.length} NOAA highs and lows, ${begin} to ${end}`);
console.log(`time off (min): median ${q(m, .5)}, 90th percentile ${q(m, .9)}, max ${Math.max(...m)}`);
console.log(`height off (in): median ${q(h, .5).toFixed(2)}, max ${Math.max(...h).toFixed(2)}`);
const far = rows.filter(r => r.minutes > 10), near = rows.filter(r => r.minutes <= 10);
const avg = a => (a.reduce((x, r) => x + r.turn, 0) / a.length).toFixed(2);
console.log(`times off by more than 10 min: ${far.length}; mean height change to the neighboring tide ${avg(far)} ft, against ${avg(near)} ft for the rest`);
// Lag from the Moon's transit over Hilo (upper or lower) to the next high tide in the model.
const LONW = 155.08, D2R = lib.D2R;
const lha = ms => { const p = lib.args(ms); const Mm = (p.s - p.p) * D2R, F = (93.272 + 13.22935 * p.D) * D2R;
  const lam = (p.s + 6.289 * Math.sin(Mm)) * D2R, beta = 5.128 * Math.sin(F) * D2R, eps = 23.44 * D2R;
  const ra = Math.atan2(Math.sin(lam) * Math.cos(eps) - Math.tan(beta) * Math.sin(eps), Math.cos(lam)) / D2R;
  return ((280.46061837 + 360.98564736629 * p.D - LONW - ra) % 360 + 360) % 360; };
const transits = []; for (let ms = t0; ms <= t1; ms += 6e4) { const a = lha(ms), b = lha(ms + 6e4); if ((a > 300 && b < 60) || (a < 180 && b >= 180)) transits.push(ms); }
const lag = ext.filter(e => e[2] === 'H').map(e => { const t = transits.filter(x => x <= e[0]).pop(); return t ? (e[0] - t) / 36e5 : null; }).filter(x => x != null);
console.log(`high tide after the Moon's transit (h): median ${q(lag, .5).toFixed(2)}, middle 80% ${q(lag, .1).toFixed(2)} to ${q(lag, .9).toFixed(2)}`);
