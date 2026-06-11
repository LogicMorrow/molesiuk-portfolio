# mateusz-olesiuk-website

Strona-wizytówka **Mateusza Olesiuka** — specjalisty ds. wdrożeń AI&nbsp;i&nbsp;automatyzacji w&nbsp;MŚP.
Vanilla HTML/CSS/JS, jeden `index.html`, zero frameworka, zero build-stepu. Hostowana na GitHub Pages.

## Struktura

```
index.html              — cała strona (onepage, 7 sekcji)
style.css               — design tokens + layout
app.js                  — scroll-reveal, sticky-nav, modal wideo, count-up, menu
assets/
  ├── favicon.svg       — ikona (monogram MO)
  ├── cv/               — CV do pobrania (cv-mateusz-olesiuk.pdf)
  └── img/              — zdjęcia, postery wideo, OG image (1200×630)
```

## Podgląd lokalny

```bash
# dowolny statyczny serwer, np.:
python -m http.server 8080
# → http://localhost:8080
```

## Deploy

GitHub Pages: **Settings → Pages → Source: `main` / root**.
Domena docelowa `mateuszolesiuk.pl` podpinana na końcu (CNAME + DNS).
