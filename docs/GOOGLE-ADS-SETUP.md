# Google Ads conversion tracking — setup guide

The site already carries one Google tag (GA4 property `G-ZCTNDH2BGF`) on every page.
`js/tags.js` adds the Google Ads account to that same tag and `js/main.js` fires:

| What the visitor does | GA4 event | Google Ads conversion | Role |
|---|---|---|---|
| Submits the contact / estimate form (Formspree accepts it) | `generate_lead` | `ADS_LEAD_LABEL` with enhanced-conversion user data (email, phone, name) | **Primary** (what Smart Bidding optimizes for) |
| Taps a phone number link | `phone_call_click` | `ADS_CALL_LABEL` | Secondary |
| Clicks a "Book a free in-person estimate" button | `book_estimate_click` | none | Engagement only |

Nothing Ads-related fires until `ADS_ID` is filled in, so the site is safe to deploy first.

## One-time setup in Google (Marco, ~20 min)

Sign in with the Google account that should own advertising for the shop.

1. **Google Ads account** — https://ads.google.com → create the account (or open the existing one).
   Note the customer ID (top right, `123-456-7890`).
2. **Auto-tagging** — Ads → Admin → Account settings → Auto-tagging → ON. Required for GA4 ↔ Ads attribution.
3. **Link GA4** — Google Analytics https://analytics.google.com → Admin → Product links → Google Ads links → Link the Ads account.
   (Marco's Google account needs Editor access on the GA4 property `G-ZCTNDH2BGF`; whoever created it on 2026-05-08 grants that under Admin → Property access management.)
4. **Conversion action 1 — Estimate request (website form)**
   Ads → Goals → Conversions → Summary → **+ New conversion action** → Website → enter `earlscheibconcord.com` → scan → **Add a conversion action manually**:
   - Goal: *Submit lead form* · Name: `Estimate request (website form)` · Value: don't use a value (or a flat estimate value) · Count: **One** · Attribution: data-driven · Primary action: **on**.
   - Under **Enhanced conversions**, turn ON and pick **Google tag** as the method; accept the customer-data terms.
   - Save. Choose **Install the tag yourself** → note the **Conversion ID** (`AW-…`) and **Conversion label** (the part after the slash).
5. **Conversion action 2 — Phone click (website)** — same flow, Goal: *Phone call lead* / "Clicks on your number", Name `Phone click (website)`, Count **One**, mark as **Secondary** (Ads → Goals → Conversions → Settings → primary/secondary). Note its label.
6. **Send the three values** (Conversion ID + two labels) to Jas. They go into `js/tags.js`:
   ```js
   ADS_ID: "AW-123456789",
   ADS_LEAD_LABEL: "AbCdEfGhIjKlMnOp",
   ADS_CALL_LABEL: "QrStUvWxYz012345",
   ```
   Commit → GitHub Pages redeploys in about a minute.
7. **Verify** — Ads → Goals → Conversions: both actions should move from *Inactive* to *Recording conversions* within 24 h of a real submit. GA4: Admin → Events → mark `generate_lead` as a **key event** (then optionally import it into Ads as a *secondary* conversion for cross-checking; never primary, or it double-counts).

## Why this shape (Google's current guidance for lead-gen sites)
- Native Ads conversion tag as the **primary** signal: Smart Bidding, view-through conversions and enhanced conversions only work on the native tag. GA4 imports are secondary/diagnostic.
- **Enhanced conversions** ride on the native tag: the Google tag hashes the lead's email/phone in the browser and matches it to the signed-in ad click, recovering conversions that cookies now miss. Google's own estimate is a 5–15 % lift in attributed conversions.
- One Google tag with both IDs (`G-…` + `AW-…`), no Tag Manager: the site is 11 static pages with one form; GTM would add a layer with no benefit.
- No cookie banner: the shop serves California customers only, and Google does not require Consent Mode outside the EEA/UK/Switzerland. If the site ever targets EU visitors, add Consent Mode v2 before launching those campaigns.

## Next step once leads flow: close the loop to "became a customer"
Enhanced conversions for **leads** + offline conversion import lets Ads learn which form fills became paying jobs: export won leads (email/phone + job date + value) from the shop's records to a Google Sheet on a schedule, and Ads matches them back to the original click. The user-data capture in `js/main.js` is already the first half of that.
