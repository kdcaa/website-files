# Kashyap Dental & Aesthetics — Website

Free, fast, interactive clinic website. Plain HTML/CSS/JS: no build step,
no monthly fees. Hosted on Netlify, domain kashyapdental.com.np.

## What's in this folder

| File | What it does |
|---|---|
| `index.html` | All page content (text, services, FAQ, hours, booking form) |
| `style.css` | Design. Colours live at the top in `:root { ... }` |
| `script.js` | Interactivity. **Clinic settings are at the top** (WhatsApp number, Google review link, booking URL) |
| `thanks.html` | Shown after booking if a visitor has JavaScript off |
| `404.html` | Friendly "page not found" page |
| `_headers` | Security + caching headers (Netlify reads this automatically) |
| `robots.txt`, `sitemap.xml` | Help Google find and index the site |
| `images/` | Your logo and photos |

## Interactive features

- **Live "Open now / Closed" badge**: uses Nepal time, whatever the visitor's location
- **Opening-hours table** that highlights today
- **Online booking** with live availability: taken slots greyed out, double-booking blocked, holidays closable (Google Sheets + Calendar, free)
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

## 5. Online booking system (free, Google Sheets + Calendar)

Patients pick a free slot; taken slots are greyed out; each booking is saved
to a Google Sheet, added to a Google Calendar, and emailed to the clinic.
It uses the file **`Code.gs`** (sent separately, NOT kept in this website folder).

Until you finish these steps, the form still works: requests go to
Netlify Forms (Netlify → Forms) and the clinic confirms by phone.
That same backup kicks in automatically if Google is ever unreachable.

### Set up (about 15 minutes, once)

1. Sign in to the Google account that should own the bookings (clinic Gmail is best).
2. Go to **sheets.new** → name the sheet `Kashyap Dental Bookings`.
3. In the sheet: **Extensions → Apps Script**.
4. Delete the sample code, paste **all** of `Code.gs`, click **Save** (disk icon).
   - Check the `HOURS`, `SLOT_MINUTES` and `CAPACITY` settings at the top
     match the clinic (hours must match the website's hours table).
5. In the function dropdown at the top choose **setup** → click **Run**.
   - Google asks for permission → **Review permissions** → pick your account →
     **Advanced** → **Go to (project name) (unsafe)** → **Allow**.
     ("Unsafe" only means Google hasn't reviewed your own private script; it's normal.)
   - The sheet now has **Bookings** and **Closed dates** tabs, and your Google
     Calendar has a new calendar called **Kashyap Dental Bookings**.
6. Click **Deploy → New deployment** → gear icon → **Web app**:
   - Description: `Booking`
   - Execute as: **Me**
   - Who has access: **Anyone**
   - Click **Deploy**, then **copy the Web app URL** (ends in `/exec`).
7. In this website's `script.js`, paste the URL into the settings at the top:
   `bookingApi: 'https://script.google.com/macros/s/…/exec',`
   Commit to GitHub; Netlify publishes it automatically.
8. Test: book a slot on kashyapdental.com.np, then check the sheet, your email
   and the calendar. Book the same date again; that time should show **Booked**.
9. **Optional instant phone alerts (Telegram, free):**
   - In Telegram, message **@BotFather** → `/newbot` → follow the prompts → copy the **token**.
   - Send any message to your new bot, then open
     `https://api.telegram.org/bot<TOKEN>/getUpdates` in a browser and copy the
     number after `"chat":{"id":`. That is your **chat ID**.
   - Put both into `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` in the script → Save.
   - Redeploy (see "Changing the script" below), then in the sheet use
     **🦷 Bookings → Send a test notification**.

### Daily use

- **All bookings:** the **Bookings** tab. Use the **Status** column
  (Booked / Confirmed / Completed / No-show / Cancelled) to track patients.
- **Phone alerts:** install the **Gmail** app (new booking emails) and the
  **Google Calendar** app (reminders before each appointment) on the clinic phone.
  Share the "Kashyap Dental Bookings" calendar with staff if they need to see it.
- **Cancel a booking:** set Status to **Cancelled** → the slot reopens on the website
  immediately. Then **🦷 Bookings → Remove cancelled bookings from calendar**.
- **Holidays / days off:** add a row in **Closed dates**: `2026-10-21` | `Dashain holiday`.
  Patients see the reason and can't book that day. (Delete the example row.)
- **Walk-ins or phone bookings:** add a row to Bookings yourself
  (Date as `2026-10-02`, Time as `11:00`, Status `Booked`) so the slot is blocked online.

### Changing the script later

After editing `Code.gs` in Apps Script: **Deploy → Manage deployments** →
pencil icon → Version: **New version** → **Deploy**. The URL stays the same.

### Limits (all free)

Gmail accounts can send about 100 emails a day; Apps Script has generous
free daily quotas: far more than a clinic needs.

## 6. After launch

- **Google Search Console** (free): add `kashyapdental.com.np`, verify via
  Cloudflare DNS TXT record, then submit `https://kashyapdental.com.np/sitemap.xml`.
- Put the website link on your **Google Business Profile**.
- Test with **PageSpeed Insights** (pagespeed.web.dev); aim for 90+ on mobile.
- Update `<lastmod>` in `sitemap.xml` when you make big content changes.
