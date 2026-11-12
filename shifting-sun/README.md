# Shifting Sun

Two interactive explainers in one static page:

- **Sunrise and sunset:** sunrise, sunset, solar noon and day length for two places through the year, on each place's clock or on standard time, with the equation of time that shifts them.
- **Analemma:** the figure 8 the Sun traces at each place's average solar noon, side by side.

## Choosing places

Put them in the link:

```
https://fbremer.github.io/shifting-sun/?a=Honolulu&b=London
https://fbremer.github.io/shifting-sun/?a=Springfield,%20Illinois&b=Tokyo#analemma
https://fbremer.github.io/shifting-sun/?a=-33.9,18.4,Africa/Johannesburg,Cape%20Town&b=64.1,-21.9,Atlantic/Reykjavik
```

- A city name is looked up with the free [Open-Meteo geocoder](https://open-meteo.com/) (no key). Add a region after a comma to pick between same-named places.
- `lat,lon,Area/Zone,Name` needs no lookup. The name is optional.
- With no places in the link, the page compares Honolulu and London.
- `#compare` and `#analemma` pick the view.

Time zones and daylight saving come from the browser's own time-zone rules. Sun positions use standard approximations, accurate to about a minute. Not for navigation.

One file, no build step. Made with AI assistance.
