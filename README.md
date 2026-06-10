# mateusz-olesiuk-website

Strona-wizytówka **Mateusza Olesiuka** — specjalisty ds. wdrożeń AI i automatyzacji w MŚP.
Vanilla HTML/CSS/JS, jeden `index.html`, zero frameworka, zero build-stepu. Hostowana na GitHub Pages.

## Struktura

```
index.html   — cała strona (onepage, 6 sekcji)
style.css    — design tokens + layout
app.js       — scroll-reveal, sticky-nav, modal wideo
cv-mateusz-olesiuk.pdf   — CV do pobrania (do dodania)
assets/img/  — zdjęcia, OG image (do dodania)
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
