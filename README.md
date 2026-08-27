# Homecoming

A personal safety companion for people travelling alone — students, night-shift
workers, anyone commuting after dark.

Start a journey, pick 2-3 guardians from your contacts, and share your live location
until you check in. Miss the check-in deadline and guardians are flagged. A panic
button captures photo/video and coordinates and posts an incident instantly. A fake
incoming-call screen offers a quiet way out of an uncomfortable situation.

## Status

Early build in progress. See `PROGRESS.md` for what's done and what's next.

## Stack

- **App**: Expo (React Native), Expo Router, Context API for state
- **Server**: Node + Express, MongoDB/Mongoose, JWT auth (in `server/`)

## Project structure

```
app/            Expo Router screens (file-based routing)
components/     Reusable UI, journey, map, and camera components
context/        React Context providers (auth, theme, journey, toast)
hooks/          Custom hooks
constants/      Theme tokens and app config
services/       API client
utils/          Shared helpers
server/         Express + MongoDB backend (separate package.json)
```

## Getting started

```bash
npm install
npx expo prebuild
npx expo run:ios      # or: npx expo run:android
```

This app uses native modules (camera, contacts) that don't work reliably in Expo Go,
so it runs on a development build rather than Expo Go. `expo prebuild` generates the
native `ios/` and `android/` projects (gitignored, regenerated on demand).

## Scope decisions

- **Foreground location only.** Location is tracked only while the journey screen is
  mounted — no background location tasks.
- **Polling, not WebSockets.** The app patches its location periodically; guardian
  views poll for updates. No Socket.io.
