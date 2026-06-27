# Kashyap Dental & Aesthetics — Website

A simple, free website for your clinic. No coding tools needed to edit it —
just text and image files.

## Files in this folder

- `index.html` — the page content (text, sections)
- `style.css` — colors, fonts, spacing (the beige theme)
- `script.js` — small bits of interactivity (mobile menu, footer year)
- `images/` — put your logo and photos here

## 1. Add your images

Drop these files into the `images/` folder, using these exact names
(or change the names inside `index.html` to match yours):

| File name              | What it is                          |
|------------------------|--------------------------------------|
| `logo.png`             | Your clinic logo                    |
| `clinic.jpg`           | A photo of the clinic interior      |
| `dr-rekha.jpg`         | Photo of Dr. Rekha Pandey           |
| `dr-specialist.jpg`    | Photo of the specialist doctor      |

If you don't have a photo yet, the site shows a soft placeholder box
instead — nothing breaks.

## 2. Edit the text

Open `index.html` in any text editor (Notepad, TextEdit, VS Code, or
even Netlify's web editor). Look for sections marked `<!-- EDIT: ... -->` —
those are the spots meant to be changed:

- Phone number (currently `+977XXXXXXXXXX`) — appears twice
- Email address
- Opening hours
- Specialist doctor's name and **MDS specialisation** (currently left as
  `[ Specialisation ]` — fill this in once confirmed)
- Service list — add, remove, or rename treatments
- Google Maps link (see below)

### Getting your Google Maps embed link
1. Open [Google Maps](https://maps.google.com) and search your clinic location.
2. Click **Share** → **Embed a map** → copy the link inside `src="..."`.
3. Paste it in place of the existing `src` value in the `<iframe>` in `index.html`.

## 3. Put the site online with Netlify (free)

1. Go to **netlify.com** and sign up (free, no credit card needed).
2. On your dashboard, find **"Add new site" → "Deploy manually"**
   (sometimes labeled **"Sites" → drag-and-drop area**).
3. Drag this **entire folder** (all the files together) into that box.
4. Netlify uploads it and gives you a random URL like
   `glowing-cupcake-123.netlify.app` — your site is now live.
5. Open the link to check everything looks right.

> Tip: keep editing locally, then drag-and-drop the folder again any
> time you want to update — Netlify replaces the old version automatically.

## 4. Connect kashyapdental.com.np (your free .np domain) to Netlify

1. In Netlify, open your site → **Domain management** → **Add a domain** →
   type `kashyapdental.com.np` → Add domain.
2. Netlify will show you the records it needs. Usually this is:
   - One **A record** pointing `@` (root domain) to Netlify's load
     balancer IP — Netlify shows the exact IP, currently `75.2.60.5`.
   - One **CNAME record** pointing `www` to your Netlify site address,
     e.g. `your-site-name.netlify.app`.
3. Go to **Cloudflare → your domain → DNS → Records** and add exactly
   those two records:

   | Type  | Name | Content                          | Proxy status |
   |-------|------|-----------------------------------|--------------|
   | A     | @    | 75.2.60.5 (use the IP Netlify shows you) | DNS only (gray cloud) at first |
   | CNAME | www  | your-site-name.netlify.app        | DNS only (gray cloud) at first |

   Keep the cloud icon **gray ("DNS only")** until the site is confirmed
   working — orange ("Proxied") can be turned on afterward once it loads
   correctly.
4. Wait 10–60 minutes for DNS to update, then visit
   `https://kashyapdental.com.np` to confirm it loads your site.
5. Back in Netlify, click **"Verify DNS configuration"** on the domain
   page — once verified, Netlify automatically issues a free HTTPS
   certificate (so the site shows the padlock icon).

## 5. The contact form

The form is wired for **Netlify Forms**, which is free and works
automatically once deployed on Netlify — no setup needed. Form
submissions appear under **Site → Forms** in your Netlify dashboard. You
can connect email notifications there too (Forms → Settings → add a
notification → email).

## Changing colors later

All the colors live at the very top of `style.css`, inside `:root { ... }`.
Change a hex value there and it updates the whole site — no need to hunt
through the rest of the file.
