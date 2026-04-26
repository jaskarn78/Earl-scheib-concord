# Image assets

## Photos to supply

The site is currently running with text placeholders in the `/gallery.html` page and a missing OG image. Please supply:

### Required
1. **`og-default.jpg`** (1200×630, JPEG)
   Used for Open Graph / social previews. Should be a clean, branded shot of the shop or a recent paint job.
   Path: `assets/img/og-default.jpg`

### Gallery (replace placeholder cards)
Drop before/after photos into this directory using these names so they match the existing gallery layout. Each pair should be a single composite image (before+after side by side) at minimum 1200×900:

- `gallery-01-diamond-sedan.jpg` — '70s American sedan, full Diamond service
- `gallery-02-collision-frontend.jpg` — front bumper / fender collision repair
- `gallery-03-platinum-truck.jpg` — pickup truck Platinum repaint
- `gallery-04-extra-prep-hood.jpg` — clear coat delamination hood repair
- `gallery-05-two-tone.jpg` — two-tone custom paint
- `gallery-06-insurance-fender.jpg` — insurance fender bender repair
- `gallery-07-muscle-restoration.jpg` — classic muscle car restoration
- `gallery-08-spot-repair.jpg` — SUV door panel spot repair
- `gallery-09-oxidation.jpg` — oxidation correction on faded paint

Once the photos are in this directory, edit `/gallery.html` to swap each `<div class="gallery-card">` placeholder with an `<img src="/assets/img/gallery-XX-...jpg" alt="..." />` tag.

### Optional (improves trust signals)
- `team.jpg` — group photo of the shop team for the About page
- `shop-exterior.jpg` — exterior shot of 2130 Market St
- `shop-bay.jpg` — interior bay / work-in-progress shot
