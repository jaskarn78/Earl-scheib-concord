# Earl Scheib of Concord — Site Audit

**Source:** https://www.earlscheibconcord.com (Wix-built)
**Audited:** 2026-04-26
**Auditor:** Clawdy (Claude Code)

---

## Business facts captured (verified from live site)

| Field | Value |
|---|---|
| Business name | Earl Scheib Of Concord |
| Tagline | Affordable Paint Jobs Done Right |
| Address | 2130 Market St, Concord, CA 94520, USA |
| Phone | (925) 609-7780 |
| Email | info@earlscheibconcord.com |
| Hours | Mon–Fri 8:00am–4:30pm; Sat–Sun closed |
| Ownership | Under new ownership since 2010 |
| Insurance | Works with all insurance companies; deductible assistance available |
| Production cycle | "Usually no more than 4–5 days" (per FAQ) |
| Owner/contact name surfaced | "Marco" referenced in a homepage testimonial (treat as unverified, see below) |

## Pages discovered

| URL | Title | Purpose |
|---|---|---|
| `/` | Home | Hero, intro, services preview, hours, contact form, IG embed, testimonials |
| `/services` | Services | Three paint tiers + prep tiers + extras |
| `/contact` | Contact | Address/phone/email + form (with SMS opt-in) |
| `/testimonials` | Testimonials | 3 written testimonials with name + city |
| `/faq` | FAQ | 6 Q&A entries |
| `/services-4` | Car Care | Wax aftercare guide + Amazon affiliate links |
| `/lead-collection` | (linked from CTAs) | Free estimate booking page — content not crawled |

No dedicated **Gallery** or **About** page exists. Both are obvious gaps.

---

## Services & pricing structure (from `/services`)

### Paint tiers
1. **Diamond Paint Service** — *Top Seller*
   - 3 coats premium urethane basecoat
   - 3 coats Euro-Clearcoat
   - UV sunscreen additive
   - 6-year warranty
   - OEM and generic colors
2. **Platinum Paint Service** — *Better, "Most popular"*
   - 3 coats acrylic standard urethane basecoat
   - 2 coats clearcoat
   - 3-year warranty
   - OEM and generic colors
3. **Silver Paint Service** — *Basic, "Most affordable"*
   - 2 coats top acrylic enamel paint
   - 1-year warranty
   - Generic solid colors only

### Prep tiers
- **Value Car Preparation** (included on paint services): machine/hand sanding, air-blown dust removal, chemical clean for wax/grease, seal coat
- **Extra Car Preparation** (by estimate): clear coat delamination, oxidation, paint peeling/cracking, deep scratches, pinstripe/decal removal

### Additional services (by estimate)
Bodywork, UV sunscreen protection, full clear coat, two-tone paint, large vehicle charge, door jambs, under hood/trunk

**No dollar pricing shown on the live site.** Only "$500 or more below other shops" is hinted in the homepage hero, and FAQ explicitly says estimates are in-person only ("Each vehicle is different, when you bring yours in we'll help you select…"). The rebuild will preserve the no-price-quoted policy.

---

## Per-page issues

### Home (`/`)
**Content problems:**
- Hero CTA "Book in-person FREE Estimate" appears 7+ times on a single page — feels spammy and dilutes the click target.
- Phone number repeats 3 times in the visible chrome.
- Two competing CTAs ("Book in-person FREE Estimate" vs phone tap) without hierarchy.
- Mixes 4 testimonials labelled Google/Yelp/Facebook with very specific dollar claims ("$600 under dealer's quote") — these read like Wix template **placeholder** content, not real reviews. *Treat as unverified — should not be carried forward.*
- "Follow us on Instagram @earlscheibofconcord" embed dependent on Wix; will not survive a static rebuild without manual handling.
- Body copy buried in walls of text without scannable bullets.

**Structure problems:**
- No visible H1 hierarchy (Wix uses div+role styling).
- Hero lacks an above-the-fold trust signal (years in business, # cars painted, warranty badge).
- No clear conversion funnel: where does the user land after clicking "Free Estimate"? `/lead-collection` is a third page with another form.

### Services (`/services`)
- The three tiers are listed but not visually compared — user has to scroll vertically and remember.
- Repeated "Book in-person Free Estimate" button on every tier (6 instances).
- No pricing anchors at all. Adding "starting at" pricing isn't supported by source data; we will keep "Free in-person estimate" as the only price signal.
- Warranty length is the most differentiating fact between tiers but not visually emphasized.

### Contact (`/contact`)
- Form fields: Name, Phone, Email, Message — fine.
- Includes SMS opt-in language (TCPA-compliant — keep this).
- **No embedded map** despite address being prominent. Users have to copy/paste into Maps.
- **No hours displayed on this page** — users coming directly to /contact don't know when the shop is open.

### Testimonials (`/testimonials`)
- Only 3 testimonials. All sound authentic (no suspicious dollar-amount claims, plausible voice).
- Anthony R. (Martinez, CA), Judy B. (San Francisco, CA), Andrew D. (Concord, CA).
- These are the testimonials we should preserve.

### FAQ (`/faq`)
- Solid, useful content. 6 Q&As. **Carry forward verbatim.**
- This is the strongest page on the current site.

### Car Care (`/services-4`)
- Pure aftercare advice + Amazon affiliate links to Meguiar's products and a chamois.
- Useful content but oddly buried under URL `/services-4` and labeled "Car Care" in nav.
- The Amazon links use `amzn.to` shortlinks (assumed monetized — preserve them).

### Missing entirely
- **About page**: who is the owner, what's the story, what's "new ownership since 2010" really mean, what makes this shop different from the franchise it shares a name with.
- **Gallery**: no before/after photos. This is the #1 highest-impact addition for an auto body shop website.
- **Service area page or LocalBusiness markup**: nothing telling Google "we serve Concord, Walnut Creek, Pleasant Hill, Martinez."

---

## UX, mobile, a11y, conversion findings

### UX
- Wix navigation collapses to a hamburger on mobile but the hamburger label isn't differentiated.
- "Skip to Main Content" link is present (good) but rest of a11y is uneven.
- No sticky phone CTA on mobile — user has to scroll back to top to call.
- Multiple CTAs of equal weight on every page (decision fatigue).

### Mobile
- Wix Thunderbolt does responsive, but the hero text wraps poorly at common breakpoints (375–414px).
- Testimonials section uses fixed-width cards that scroll horizontally — fine but no visible affordance.
- Bottom-of-page phone number is small and not click-to-call styled.

### Accessibility (WCAG)
- Heading levels are inconsistent (Wix uses styled divs not semantic `<h1>`/`<h2>`).
- Color contrast is acceptable but the gray-on-light-gray testimonial text is borderline.
- Form labels rely on placeholders (Name/Email/etc.) which disappear on focus — fails WCAG 2.4.6.
- No visible focus rings on link/button hover state.
- No `lang` attribute issues (Wix sets it).

### Conversion blockers
1. No "starting at" or pricing anchor anywhere — the FAQ explicitly defends this, and we will respect it, but we'll add stronger trust copy ("$500+ below other shops") in the hero and a "What to expect" section to reduce friction before the free estimate.
2. No social proof above the fold (Google rating, # of cars painted, years).
3. Phone number is not a `tel:` link in the body — only the header has click-to-call.
4. No gallery → user has no proof of work quality before committing to come in.
5. Form submission goes nowhere visible (no thank-you copy, no fallback "we respond within X hours").

### SEO
- Title tags are weak: home is `www.earlscheibconcord.com | Affordable car painting | 2130 Market St, Concord, CA, USA` (URL-as-brand is wasted real estate).
- No visible meta description differentiation per page.
- No schema.org markup for LocalBusiness, AutoBodyShop, or AggregateRating.
- No sitemap.xml at standard path.
- Internal linking is mostly via top nav — no contextual cross-links.
- "Affordable" is the only keyword the site goes after; missing "Concord auto paint", "auto body shop Concord CA", "collision repair Concord", "car painting Walnut Creek/Pleasant Hill" intent variations.

---

## Trust signals already present (carry forward)
- "Under new ownership since 2010" — 14+ years
- "Three package tiers"
- "We work with all insurance companies"
- "Deductible assistance available"
- "Six-year warranty" (top tier)
- "Production line approach… 4–5 days" (FAQ)
- "$500 or more below other shops" (homepage hero)

## Trust signals to add (if Jas confirms data)
- Number of cars painted to date (placeholder in rebuild)
- Google rating + review count (placeholder)
- BBB rating / accreditations (placeholder)
- Years combined experience of staff (placeholder)

---

## What the rebuild will do

- Plain HTML + Tailwind CDN + minimal vanilla JS, GH Pages-ready (.nojekyll, root-served).
- Pages: **Home, Services, Gallery, About, Contact, FAQ, Car Care** (7 total).
- Mobile-first, sticky bottom-of-screen "Call (925) 609-7780" CTA on mobile.
- Single-purpose hero with one primary CTA + one secondary (call).
- Side-by-side comparison table for the three paint tiers (this is the biggest UX win).
- Embedded Google Map on Contact + hours visible on Contact.
- Real testimonials from `/testimonials` page (drop the dubious homepage ones).
- About page covering "new ownership since 2010" story.
- Gallery placeholder grid with descriptive alts — README documents that real photos must be supplied.
- LocalBusiness JSON-LD, OG tags, sitemap.xml, robots.txt, .nojekyll.
- Aesthetic: modern automotive — slate/black foundation with red accent (Earl Scheib brand red), confident typography (Inter or system stack).
- WCAG AA: semantic headings, visible focus rings, labels-not-placeholders on the contact form, color contrast verified.

## Things deliberately NOT carried forward
- The 4 homepage testimonials (James T., Sandra M., Lisa H., Robert K.) — read as Wix demo content with implausibly specific dollar claims.
- The Instagram embed (Wix-dependent, would break on static).
- The duplicate `/lead-collection` page — collapsing to a single Contact form.
- The `services-4` URL — renaming to `/car-care` for clarity.

## Open questions for Jas
1. Are the homepage testimonials with specific dollar amounts real or template placeholders? (Current assumption: placeholders, dropping them.)
2. Is "Marco" the owner? Should we name him on the About page?
3. Should the Amazon affiliate links on Car Care stay (assumed yes — they monetize)?
4. Real Google review count + rating to display? (Placeholder used otherwise.)
5. Photos for the Gallery — when can real before/afters be supplied?
