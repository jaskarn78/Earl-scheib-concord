# Earl Scheib Of Concord — Static Site

Static HTML rebuild of [earlscheibconcord.com](https://www.earlscheibconcord.com) — auto paint &amp; collision repair shop in Concord, CA.

## Stack
- Plain HTML5 + Tailwind CSS (CDN) + minimal vanilla JS
- No build step
- Deployable to GitHub Pages from repo root

## Local preview
```bash
cd Earl-scheib-concord
python3 -m http.server 8080
# open http://localhost:8080
```

## Pages
| File | Purpose |
|---|---|
| `index.html` | Home — hero, services preview, why-us, reviews, CTA |
| `services.html` | Three paint tiers + prep + add-ons + comparison table |
| `gallery.html` | Before/after grid (placeholder tiles — real photos pending) |
| `about.html` | Shop story, values, service area |
| `faq.html` | 6-question FAQ with `FAQPage` JSON-LD |
| `testimonials.html` | 3 customer reviews + Google/Yelp CTAs |
| `car-care.html` | Aftercare guide |
| `contact.html` | Form + hours + embedded map |
| `404.html` | Not-found page |

## SEO assets
- `sitemap.xml` — all 8 pages listed
- `robots.txt` — allow all + sitemap reference
- `img/favicon.svg` — Earl Scheib "ES" red/white mark
- `img/og.svg` — Open Graph card
- `AutoBodyShop` JSON-LD on home page (NAP, hours, service area)
- `FAQPage` JSON-LD on FAQ page

## Photos needed
The Gallery page uses placeholder tiles labelled by car/job. To go live with real content, replace each `<div class="gallery-ph">…</div>` in `gallery.html` with a real `<picture>` or `<img>` block:

```html
<figure>
  <img src="img/gallery/civic-respray.jpg" alt="2014 Honda Civic before/after Diamond repaint" class="rounded-lg w-full" loading="lazy">
  <figcaption class="text-sm text-zinc-600 mt-2">Honda Civic · full repaint · Diamond package</figcaption>
</figure>
```

Drop new photos into `img/gallery/` (create the folder). Recommended:
- 9 before/after composites at ~1200×900 px JPG (under 200 KB each after optimization)
- One marquee hero photo for `index.html` (replace the placeholder `gallery-ph` near the hero)

## Contact form
The form on `contact.html` uses a `mailto:` fallback (no backend exists on GitHub Pages). To upgrade:
- Switch to **Formspree** or **Web3Forms** with a single `action` URL change in `contact.html`
- Or migrate to **Cloudflare Pages** + a Worker if you want full control

The SMS opt-in checkbox on the form is for TCPA compliance — keep its language verbatim if collecting numbers for service follow-ups.

## Domain
The site is currently deployed to GitHub Pages at:
```
https://jaskarn78.github.io/Earl-scheib-concord/
```

To point `www.earlscheibconcord.com` at this site:
1. In GitHub: Settings → Pages → Custom domain → `www.earlscheibconcord.com`
2. At your DNS host: add a CNAME record `www → jaskarn78.github.io`
3. (Optional) Add an apex `A` record set to GitHub Pages IPs (185.199.108.153, 185.199.109.153, 185.199.110.153, 185.199.111.153) and an `ALIAS`/`ANAME` if your DNS host supports it.
4. Wait for HTTPS cert provisioning (a few minutes), then enable "Enforce HTTPS."
5. Update the `<link rel="canonical">`, OG URLs, and sitemap to use the custom domain.

## Editing copy
All text content lives directly in the HTML files — there's no CMS. Quick reference:
- **Phone:** search-and-replace `(925) 609-7780` and `tel:+19256097780`
- **Address:** search-and-replace `2130 Market St`
- **Hours:** in the footer of every page and the Hours block on `contact.html`
- **Service tier specs:** `services.html` (table + description sections) and `index.html` (preview cards)

## License
Content (copy, photos to be added) © Earl Scheib Of Concord. Code (HTML/CSS/JS structure) — use freely.
