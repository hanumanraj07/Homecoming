# Homecoming

A personal safety companion for people travelling alone — students, night-shift
workers, anyone commuting after dark.

Start a journey, pick guardians from your contacts, and share your live location
until you check in. Miss the check-in deadline and the countdown on your dashboard
turns red. A panic button (hold to activate, or shake your phone) captures a photo
and your coordinates and posts an incident instantly. A fake incoming-call screen
offers a quiet way out of an uncomfortable situation.

## Status

Feature-complete for the 3-day build plan in `PROGRESS.md` — every checklist item
below has a working implementation. Nothing in this repo has been run on a real
device or against a live database; see **Testing** below before you trust it with
real safety-critical use.

## Feature coverage

| Area | What's built |
| --- | --- |
| Auth | Register, login, JWT + SecureStore, protected routes, logout |
| Journeys | Create, live tracking with a path polyline, countdown, check-in, history |
| Guardians | Contact import (search, multi-select), manual add/edit/delete, call/WhatsApp |
| Location & maps | Permission handling, current + last-known position, destination search, reverse geocoding, recenter |
| Camera & media | Capture (photo + video), flip/torch/zoom, gallery picker, compression via capture quality, multipart upload with progress |
| Safety | Hold-to-activate panic button, shake-to-alert, fake call (ringtone + vibration), incident reports with photo |
| UI/UX | Light/dark theme, empty/error/loading states throughout, toasts, confirm dialogs, pull-to-refresh |

## Stack

- **App**: Expo (React Native), Expo Router, Context API for state (no Redux)
- **Server**: Node + Express, MongoDB/Mongoose, JWT auth, multer for uploads (in `server/`)

## Project structure

```
app/            Expo Router screens (file-based routing)
  (auth)/       Login, register
  (app)/        Tabs: home, map, guardians, profile — behind an auth guard
  journey/      Create + live-tracking (dynamic [id])
  incident/     Auto SOS capture flow + confirmation (dynamic [id])
  camera.jsx    Standalone capture screen (photo/video, gallery picker)
  fake-call.jsx Incoming-call screen
components/
  ui/           Design system primitives (Button, Input, Card, Toast, ...)
  journey/      PanicButton
  camera/       CaptureControls, MediaPreview
context/        Theme, Auth, Toast providers
hooks/          useLocation, useCamera, useContacts, useCountdown, useShakeDetector
constants/      Theme tokens and app config
services/       API client (axios) + per-resource wrappers
utils/          Validation helpers
server/         Express + MongoDB backend (separate package.json)
```

## Getting started

### Backend

```bash
cd server
npm install
cp .env.example .env   # fill in MONGO_URI and JWT_SECRET
npm run dev
```

`MONGO_URI` needs a real MongoDB — a local `mongod` or an Atlas free-tier cluster
both work. `JWT_SECRET` should be a long random string (`node -e
"console.log(require('crypto').randomBytes(32).toString('hex'))"` works).

### App

```bash
npm install
cp .env.example .env   # set EXPO_PUBLIC_API_URL
npx expo prebuild
npx expo run:ios       # or: npx expo run:android
```

This app uses native modules (camera, contacts, sensors) that don't work reliably
in Expo Go, so it runs on a development build rather than Expo Go. `expo prebuild`
generates the native `ios/`/`android/` projects (gitignored, regenerated on demand)
— re-run it any time you add a native dependency or change permission strings in
`app.json`.

`EXPO_PUBLIC_API_URL` needs to point at wherever the backend above is actually
reachable from your device or simulator:
- iOS Simulator on the same machine: `http://localhost:4000/api` (the default)
- Physical device: your machine's LAN IP, e.g. `http://192.168.1.20:4000/api`
- Android Emulator: `http://10.0.2.2:4000/api`

**Android maps need a Google Maps API key.** `react-native-maps` uses Apple Maps
on iOS out of the box — nothing to configure. On Android it needs a key from
[Google Cloud Console](https://console.cloud.google.com/) added to `app.json` as
`expo.android.config.googleMaps.apiKey`, then `expo prebuild` re-run. Without it
the map screen still works, but tiles will be blank on Android.

## Architecture notes

- **State**: three Context providers at the root (`ThemeProvider`, `ToastProvider`,
  `AuthProvider`) — no Redux, kept intentionally simple. Screens fetch their own
  data with plain `useState`/`useEffect` and the `services/*.js` API wrappers;
  there's no client-side cache or global data store beyond auth and theme.
- **Auth**: JWT stored in `expo-secure-store`, attached to every request by an
  axios request interceptor (`services/api.js`). A response interceptor clears the
  session on a 401 from an *already-authenticated* request only — a wrong password
  on `/login` doesn't trigger a global logout, since that request never carried a
  token to begin with.
- **Permissions**: each feature requests its own permission at the point it's
  actually needed (`useCameraPermissions`, `useLocation`'s permission request,
  `useContacts`, etc.) rather than a single upfront onboarding permissions screen —
  there isn't one, since the onboarding carousel is cut from this build's scope.
- **Panic flow**: the hold-to-activate button (`components/journey/PanicButton.jsx`)
  doesn't capture anything itself — it navigates to `app/incident/new.jsx`, which
  gets the current position, silently captures one photo the moment the camera
  reports genuinely ready, uploads it, and creates the incident, all behind a single
  status screen. It degrades gracefully at every step: no camera permission, a
  failed capture, or a failed upload all still result in the alert being sent with
  whatever data is available — the alert is never blocked on media.
- **Compression**: images are captured/picked at `quality: 0.5` rather than
  compressed as a separate post-processing step. `expo-image-manipulator` was never
  added to the dependency list, and controlling quality at the capture source is a
  simpler, legitimate approach for this scope.

## Scope decisions

These were deliberate cuts or judgment calls made to hit a 3-day build, not
oversights:

- **Foreground location only.** Location is tracked only while a screen that needs
  it (the map, an active journey) is mounted — no background location tasks, no
  location access when the app isn't open.
- **Polling, not WebSockets.** The app PATCHes its location roughly every 10
  seconds while a journey is active (`useLocation`'s watch interval). No Socket.io,
  no server push. There's no separate guardian-facing app or view in this build —
  guardians are stored as contacts a journey is shared "with" in spirit, but no
  notification actually reaches their phone (see below).
- **No push/SMS notifications to guardians.** `expo-notifications` was on the
  approved stack but nothing in the 3-day checklist actually required sending a
  guardian a notification, so it was never wired up. Missing a check-in deadline
  currently just turns the countdown red on your own dashboard — it does not alert
  anyone. This is the single biggest gap between what the product pitch implies
  ("guardians get alerted") and what's actually implemented; treat the "guardian
  notified" language in the UI as aspirational until this exists.
- **Cut entirely** (per the compressed 3-day plan): onboarding carousel, custom
  animated tab bar, pagination, skeleton loaders (plain spinners instead),
  community unsafe-spot map (the `Incident` schema still supports an `unsafe_spot`
  type, but nothing creates one), a formal accessibility audit, and an offline
  action queue (screens handle a failed request with a normal error/retry state,
  but nothing queues actions made while offline for later sync).
- **`expo-av` for video preview only.** It's the dependency the brief approved, but
  it's not officially supported for this Expo SDK anymore (Expo's direction is
  `expo-video`/`expo-audio`). Used here only for the narrowest case — playing back
  a captured video in a preview screen — not recording.
- **`expo-sensors` was added without prior approval.** Shake-to-alert requires
  reading device motion and there's no way to do that without some sensors API;
  this is the official Expo module for it. Every other dependency in this repo was
  on the originally approved list.
- **Tap-to-focus is not implemented as literal focus-at-a-point.** `expo-camera`'s
  `CameraView` doesn't expose a simple API for it in the installed version. Zoom
  and flip are real.

## Testing

Every session's work was validated with `npx expo export --platform ios` (a clean
static Metro bundle — confirms every file imports and compiles correctly) and,
where possible, curl against the running backend. Neither of those substitutes for
running the app. Specifically **not yet verified on a real device or against a live
database**:

- Register → login → dashboard → logout, end to end
- Creating a journey and watching the map update as you move
- The full panic → photo → upload → incident round trip
- Contact import, permission-denied states, and camera/gallery on an actual device
- Fake call ringtone/vibration actually playing and stopping correctly
- Shake detection sensitivity

A backend bug *was* caught and fixed this way: the auth middleware was masking
database connection failures as "invalid token" 401s instead of the real error —
found by curl-testing against this sandbox's intentionally-unreachable MongoDB
(see `PROGRESS.md`, session 2B, for the full story).

The first real test pass — point `MONGO_URI` at a live database, run the app on a
device or simulator, and walk through register → journey → panic button → fake
call — is the natural next step before treating this as done.
