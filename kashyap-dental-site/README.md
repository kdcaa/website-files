# Kashyap Dental & Aesthetics — Website

Free, fast, interactive clinic website. Plain HTML/CSS/JS: no build step,
no monthly fees. Hosted on Netlify, domain kashyapdental.com.np.

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | All page content (text, services, FAQ, hours, booking form) |
| `style.css` | Design. Colours live at the top in `:root { ... }` |
| `script.js` | Interactivity. **Clinic settings are at the top** (WhatsApp number, Google review link) |
| `thanks.html` | Shown after booking if a visitor has JavaScript off |
| `404.html` | Friendly "page not found" page |
| `_headers` | Security + caching headers (Netlify reads this automatically) |
| `robots.txt`, `sitemap.xml` | Help Google find and index the site |
| `images/` | Your logo and photos |

## Interactive features

- **Live "Open now / Closed" badge**: uses Nepal time, whatever the visitor's location
- **Opening-hours table** that highlights today
- **Booking form** with date picker, clickable time slots, validation, and closed-day blocking
- **"Send via WhatsApp"**: turns the booking into a pre-filled WhatsApp message
- **Service pop-ups**: "Learn more" on each service, with a "Book this treatment" button that pre-selects it in the form
- **FAQ accordion**, scroll animations, active-section menu highlight
- Floating WhatsApp button, back-to-top button, mobile menu
- Google-friendly: structured data (Dentist schema), social share previews, sitemap
- Accessible: keyboard friendly, skip link, respects "reduce motion"

## 1. Add your images

Put these in `images/` with these exact names:

| File | What |
|---|---|
| `logo.png` | Clinic logo (also used as browser tab icon) |
| `clinic.jpg` | Clinic photo (also the preview when the link is shared on Facebook/WhatsApp; landscape, about 1200×630 works best) |
| `dr-rekha.jpg` | Dr. Rekha Pandey (square) |
| `dr-specialist.jpg` | Specialist doctor (square) |

Missing photos show a neat placeholder; nothing breaks. Keep each image
under ~300 KB (compress free at squoosh.app) so the site loads fast on mobile data.

## 2. Things to fill in / check

Search `index.html` for `EDIT:` and `[ ` to find placeholders:

- Specialist doctor's **name** and **MDS specialisation**
- Service descriptions inside each `service-details` block (reviewed by the dentist)
- **Opening hours**: edit the `hours-table`. The `data-open` / `data-close`
  values (24h, e.g. `18:00`) drive the Open-now badge and booking slots.
  For a closed day, remove `data-open`/`data-close` and write `Closed`.
  Also update `openingHoursSpecification` in the `<head>` to match.
- Phone number appears in several places; use find-and-replace if it changes.

In `script.js` (top of the file):

- `whatsapp`: number with country code, digits only
- `reviewUrl`: paste your Google review link (Google Business Profile →
  "Ask for reviews" → copy link). The "Review us on Google" button appears once set.
- `slotMinutes`: booking slot length

### Google Maps embed
Google Maps → search your clinic → **Share → Embed a map** → copy the
`src="..."` link → paste it into the `<iframe>` in the Visit section.
Also point the "Get directions" button at your clinic's Maps share link.

## 3. Deploy / update on Netlify

**Simple way:** Netlify → your site → **Deploys** → drag this whole folder
into the drop zone. Done in seconds.

**Developer way (recommended):** put the folder in a GitHub repository,
then Netlify → **Add new site → Import from Git** → pick the repo.
Publish directory: `/` (leave build command empty). From then on, every
change you push to GitHub auto-deploys, and you get full version history
(you can roll back any mistake).

## 4. Domain (kashyapdental.com.np)

Already connected via Cloudflare DNS:

| Type | Name | Content | Proxy |
|---|---|---|---|
| A | @ | IP shown by Netlify (usually 75.2.60.5) | DNS only (grey) |
| CNAME | www | your-site.netlify.app | DNS only (grey) |

Netlify issues free HTTPS automatically once DNS verifies.

## 5. Booking requests (Netlify Forms)

Submissions appear in Netlify → your site → **Forms → booking**.
Set up email alerts: **Forms → Form notifications → Add notification → Email**.
Free plan includes 100 submissions/month. Spam is filtered by a hidden honeypot field.

After first deploy, open Forms and check "booking" is listed. If not, go to
**Forms** and click **Enable form detection**, then redeploy.

## 6. After launch

- **Google Search Console** (free): add `kashyapdental.com.np`, verify via
  Cloudflare DNS TXT record, then submit `https://kashyapdental.com.np/sitemap.xml`.
- Put the website link on your **Google Business Profile**.
- Test with **PageSpeed Insights** (pagespeed.web.dev); aim for 90+ on mobile.
- Update `<lastmod>` in `sitemap.xml` when you make big content changes.
