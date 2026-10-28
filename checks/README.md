# Checks

Each script loads the model code straight from the page, so it tests what the page runs. Node 18 or later; both fetch live data.

```bash
node checks/tides_vs_noaa.mjs 20261028 20261127
node checks/sun_vs_usno.mjs
```

Results on 2026-10-28:

| Check | Result |
| --- | --- |
| Tide heights vs NOAA's predicted highs and lows (120, Oct 28 to Nov 27) | Median 0.28 in, max 1.07 in |
| Tide times vs NOAA | Median 3 min, 90th percentile 11 min, max 36 min. The 13 misses over 10 min are weak tides (0.43 ft from the neighboring tide on average, against 1.20 ft) |
| High tide after the Moon's transit over Hilo | Median 2.68 h |
| Sunrise and sunset vs the US Naval Observatory, 8 dates | Within 1 min |
| Lāhainā Noon in Hilo (analemma page) | May 19 and Jul 25 |
| Analemma's figure-8 crossing | Apr 15 and Aug 29 |
