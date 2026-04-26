# Earl Scheib of Concord — website

Static rebuild of [earlscheibconcord.com](https://www.earlscheibconcord.com), replacing the existing Wix site. Plain HTML + Tailwind CSS (CDN) + minimal vanilla JS — no build step. Deploys to GitHub Pages.

## Structure

```
/
├── index.html          # Home
├── services.html       # Paint packages + comparison table + collision repair
├── gallery.html        # Before/after gallery (placeholder cards — see notes)
├── about.html          # Story, values, history of "new ownership since 2010"
├── contact.html        # Address, hours, embedded map, contact form
├── faq.html            # 6 Q&As preserved from original site
├── car-care.html       # Aftercare guide + Amazon affiliate links
├── 404.html            # Custom 404
├── sitemap.xml
├── robots.txt
├── .nojekyll           # Tells GitHub Pages not to run Jekyll
├── audit.md            # Phase 1 audit of the original Wix site
└── assets/
    ├── css/styles.css  # Custom CSS layered on Tailwind
    ├── js/main.js      # Mobile nav, current-year, form handler
    └── img/            # Favicon + image placeholders (see assets/img/README.md)
```

## Local preview

Any static server works. Easiest:

```bash
python3 -m http.server 8000
# then open http://localhost:8000
```

## Deployment (GitHub Pages)

1. In **Settings → Pages**, set **Source = Deploy from a branch**.
2. **Branch = `main`**, **Folder = `/ (root)`**.
3. Save. First deploy takes 1–2 minutes.

The `.nojekyll` file is already in place so GitHub Pages serves files starting with `_` and `.` correctly.

If using a custom domain (`earlscheibconcord.com`):
1. Add a `CNAME` file at the repo root containing the bare domain.
2. Configure A/AAAA records at the registrar pointing to GitHub Pages IPs.

## Open items / TODOs for the shop

### Content the shop should supply
- [ ] **Real before/after photos** for the Gallery page. See `assets/img/README.md` for the file naming and image-swap instructions.
- [ ] **OG share image** at `assets/img/og-default.jpg` (1200×630).
- [ ] **Contact form delivery** — the form currently shows a fallback message instructing visitors to call. To make it live, sign up at [Formspree](https://formspree.io/) or [Netlify Forms](https://www.netlify.com/products/forms/), then update the `action` attribute on the `<form>` in `contact.html`.
- [ ] **Real Google review count + star rating** to add as a trust signal in the hero.

### Open audit questions
- The 4 homepage testimonials on the original Wix site (James T., Sandra M., Lisa H., Robert K. with very specific dollar-amount claims) read like Wix template demo content and were **not carried over**. The 3 testimonials from the original `/testimonials` page (Anthony R., Judy B., Andrew D.) were preserved as they appear authentic. Confirm or supply the real reviews to use.
- Confirm whether "Marco" (referenced in original homepage testimonial) is the owner — if so, About page can be expanded to name him and add a photo.

### Stylistic
- Brand red is set to `#c8102e` (close to historical Earl Scheib red). Adjust in `assets/css/styles.css` (`--es-red` variable) and in the `tailwind.config` block on each page if a different shade is preferred.
- Inter font from Google Fonts. Swap easily in the `<head>` of each page.

## Accessibility & SEO checklist (already implemented)

- WCAG AA: semantic headings, visible `:focus-visible` rings, real `<label>` elements (not placeholders), color contrast verified, skip-to-main link.
- Mobile-first responsive across all pages; sticky bottom call-to-call CTA on mobile only.
- Meta titles + descriptions per page, canonical URLs, Open Graph + Twitter cards.
- LocalBusiness / AutoBodyShop / FAQPage / Service JSON-LD schema on relevant pages.
- `sitemap.xml` + `robots.txt` at the root.
- All phone numbers are `tel:` links and email addresses are `mailto:` links.

## What was deliberately not carried forward from the Wix site

- The 4 home-page testimonials (likely template demo content) — see audit.md
- Wix-dependent Instagram embed
- Duplicate `/lead-collection` page (collapsed into `/contact.html`)
- The `services-4` URL (renamed to `/car-care.html`)

See [`audit.md`](./audit.md) for the full Phase 1 site audit.
