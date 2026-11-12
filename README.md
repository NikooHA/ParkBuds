# ParkBuds

A small Expo app for seeing who is at the park and checking yourself in. The home screen lists visitors over a dog portrait. Check in with your dog’s name and your name, then tap your row later to leave.

Check-ins are shared through a free [Supabase](https://supabase.com) database, so everyone with the site sees who is at the park. A visit ends after 30 minutes, or when you tap **I’m leaving**. Up to 30 people can be checked in at once; the database enforces both limits (`supabase/schema.sql`), and the site refreshes the list every 15 seconds.

## Run it

```bash
npm install
npm start
```

Then open the project in Expo Go, or use:

```bash
npm run ios
npm run android
npm run web
```

This project uses Expo SDK 58 and Expo Router.

## How it works

- **Home** shows the portrait, a live count, and one row per visitor. With nobody there, the card says “No one is checked in.”
- **Check in** opens a blank form. **Check in!** saves the names and returns home. Your row is the only one you can tap.
- **I’m leaving** clears your names and checks you out. The next check-in starts empty again.
- Your own visit is remembered in the browser, so reloading the page keeps you checked in.
- When the park reaches 30 people, the button reads **Park is full (30)** and is disabled for anyone not already checked in.

## Project layout

```
app/                  screens (Expo Router)
  index.tsx           home
  visit.tsx           check-in
components/           home, visit form, theme, visit state, Supabase calls
supabase/schema.sql   database tables and rules for shared check-ins
assets/               app icons and the dog portrait
```

Colors live in `components/theme.ts`. Visit length (`VISIT_MINUTES`) and the park limit (`PARK_CAPACITY`) live in `components/visit-store.tsx`.

## Shared check-ins setup (one time)

1. Create a free project at https://supabase.com.
2. In the project, open **SQL Editor → New query**, paste all of `supabase/schema.sql`, and click **Run**.
3. In **Project Settings → Data API** copy the **Project URL**, and in **Project Settings → API Keys** copy the **Publishable key**.
4. Put both in `components/park-config.ts`. The publishable key is designed to be public; the database only allows checking in, renaming and leaving your own visit.

Until this is done, the site shows “Shared check-ins are not set up yet.”

## Website

The web version is deployed to GitHub Pages at **https://nikooha.github.io/ParkBuds/** by `.github/workflows/deploy-web.yml` on every push to `main`.

- Build locally: `npm run build:web` (outputs to `dist/`)
- QR code linking to the site: `assets/qr/parkbuds-website-qr.png` (print) / `.svg` (scalable)
- GitHub setup: **Settings → Pages → Source: GitHub Actions** (leave Custom domain empty).

### Moving to parkbuds.ca later

1. Buy the domain, then add DNS records: `A` for `@` → `185.199.108.153`, `185.199.109.153`, `185.199.110.153`, `185.199.111.153`; `CNAME` for `www` → `nikooha.github.io`.
2. In `app.json`, remove `experiments.baseUrl`.
3. In `.github/workflows/deploy-web.yml`, append `&& echo parkbuds.ca > dist/CNAME` to the copy step.
4. In **Settings → Pages**, set Custom domain to `parkbuds.ca` and enable **Enforce HTTPS**.
5. Regenerate the QR code for `https://parkbuds.ca`.
