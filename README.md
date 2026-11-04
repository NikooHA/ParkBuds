# ParkBuds

A small Expo app for seeing who is at the park and checking yourself in. The home screen lists visitors over a dog portrait. Check in with your dog’s name and your name, then tap your row later to leave.

There is no server. Your visit lives in memory on the device and ends after 60 minutes, or when you tap **I’m leaving**.

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
- Sample people in `data/sample-visits.ts` are always listed so the park screen can be tried with a full crowd. They are not your saved visit.

## Project layout

```
app/                  screens (Expo Router)
  index.tsx           home
  visit.tsx           check-in
components/           home, visit form, theme, visit state
data/sample-visits.ts fake visitors for testing
assets/               app icons and the dog portrait
```

Colors live in `components/theme.ts`. Change the test crowd by editing `sampleVisits`.
