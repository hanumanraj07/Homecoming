# Progress

Read this file first at the start of every session — it's the only continuity
between sessions.

## Timeline note

Deadline is 30 Aug. The build is following the compressed 3-day plan (Day 1/2/3,
sessions A-D), not the original 30-day phase plan. Cut from scope: onboarding
carousel, custom tab bar animation, pagination, skeleton loaders, community
unsafe-spot map, accessibility audit, offline queue. Kept: fake call screen,
shake-to-alert, panic hold animation.

## Done

### Session 1A — Foundation (complete)

- Expo app initialized (SDK 57, JS/JSX, no TypeScript) at repo root.
- Expo Router installed and wired up as the entry point (`main: expo-router/entry`
  in `package.json`); `app.json` has `scheme`, bundle identifiers, and the
  `expo-router` + `expo-dev-client` plugins registered.
- `expo-dev-client` installed and `npx expo prebuild` run successfully, generating
  `ios/` and `android/` (both gitignored — regenerated via prebuild, not committed).
  `npm run android` / `npm run ios` now map to `expo run:android` / `expo run:ios`
  (dev-client builds, not Expo Go).
- Full folder scaffold created per the spec: `app/` route files (all placeholder
  screens, one per spec'd route), `components/{ui,journey,map,camera}/`,
  `context/`, `hooks/`, `constants/`, `services/`, `utils/`, `server/src/`.
- `server/` scaffolded as an independent package (own `package.json`, own
  `.gitignore`) — no Express code yet, that's Session 1C.
- Root `.gitignore` covers node_modules, `.expo/`, generated `ios/`/`android/`,
  env files, etc.
- README rewritten with project description, stack, structure, and the two
  documented scope decisions (foreground-only location, polling not WebSockets).
- Validated the scaffold compiles: `npx expo export --platform ios` bundled all
  ~1100 modules and every route with zero errors.

### Known issue / limitation

- **This session ran in a cloud sandbox with no attached device, simulator, or
  Xcode/Android SDK.** `expo prebuild` and a static Metro bundle export both
  succeeded, which confirms the project structure and route files are valid, but
  the dev client build has **not** been run or installed on an actual device/
  simulator. That verification step — `npx expo run:ios` or `npx expo run:android`
  on your machine — is the first thing to do next.
- `expo install` for new packages needs `EXPO_OFFLINE=1` in this sandbox — the
  proxy here blocks `api.expo.dev` (used for version compatibility lookups). Not
  expected to be an issue on a normal machine/network.
- Minor: `expo prebuild` printed a note that `userInterfaceStyle: automatic` needs
  `expo-system-ui` to fully take effect on Android. Not installed yet since it
  wasn't in the approved dependency list — revisit in Phase/Session 1B (theme).

### Session 1B — Design system (complete)

- `constants/theme.js`: light + dark color tokens, spacing scale (4/8/12/16/24/32),
  typography scale (size/weight/lineHeight), border radii, and shadow presets (sm/md/lg).
- `context/ThemeContext.jsx`: `ThemeProvider` + `useTheme()`. Mode is
  `light` | `dark` | `system`, defaults to the device color scheme, persists the
  user's explicit choice to AsyncStorage (`homecoming.themeMode`), exposes
  `toggleTheme()` and `setThemeMode()`. Wired into `app/_layout.jsx` so the whole
  app is inside the provider; status bar style and route background now follow
  the resolved scheme.
- `components/ui/` — all 9 spec'd components, all theme-driven (no hardcoded hex
  or magic numbers), all consuming `useTheme()`: `Button` (primary/secondary/
  danger/ghost, loading/disabled, 44pt min height), `Input` (label, error text,
  icon slot), `Card`, `EmptyState` (icon/title/message/optional action — pairs
  with `Linking.openSettings()` for permission-denied screens later), `Toast`
  (self-dismissing, animated in/out), `ConfirmDialog` (modal, destructive
  variant), `ListItem` (leading/trailing slots), `Badge` (5 variants, 2 sizes),
  `FAB` (circular or extended, primary/danger). Barrel export at
  `components/ui/index.js`.
- No showcase screen was built (cut from this compressed scope) — instead the
  full set was temporarily rendered on the home screen and validated with
  `npx expo export --platform ios` (clean bundle, 1130 modules, zero errors),
  then the home screen was reverted to its Phase-4 placeholder before committing.
- Installed `@react-native-async-storage/async-storage`.

### Known issue / limitation

- Installing `@react-native-async-storage/async-storage` hit an ERESOLVE error
  from `npm` — `expo-router@57`'s own web/dom tooling (`vaul` → `@radix-ui/*`)
  pulls in `react-dom@19.2.8`, which wants `react@^19.2.8`, while the project
  pins `react@19.2.3`. Worked around with `npm install --legacy-peer-deps`
  (`npx expo install <pkg> -- --legacy-peer-deps`). This is an upstream
  expo-router peer conflict, not something introduced by this project — any
  future `npm install`/`expo install` in this repo may need the same flag until
  expo-router's own dependency tree resolves it.
- Same sandbox limitation as Session 1A: no device/simulator here, so components
  were only verified to bundle correctly, not visually verified on-device. Worth
  a quick look on a real device once you're on Session 1D or later and actually
  navigating between real screens.

### Session 1C — Backend core (complete)

- `server/src/config/db.js`: `connectDB()` wraps `mongoose.connect` with a 5s
  server-selection timeout so failures surface fast instead of hanging requests.
- `server/src/models/User.js`: matches the data model spec exactly — name,
  email (unique), phone, passwordHash (select: false), avatarUrl, createdAt.
  `toJSON` strips `passwordHash`/`__v`.
- `server/src/utils/jwt.js` (sign/verify) and `server/src/utils/ApiError.js`
  (status-coded error class).
- `server/src/validators/auth.validators.js` + `middleware/validate.middleware.js`:
  express-validator chains for register/login, formatted into a 422 response.
- `server/src/middleware/auth.middleware.js`: `protect()` — Bearer token → verify
  → load user → `req.user`, or a 401 for missing/malformed/expired/invalid
  tokens or a deleted user.
- `server/src/middleware/error.middleware.js`: `notFound` (404) +
  `errorHandler` (normalizes Mongoose validation/cast/duplicate-key errors,
  only logs to console on 500s).
- `server/src/controllers/auth.controller.js` + `routes/auth.routes.js`:
  `POST /api/auth/register` (bcrypt hash + create), `POST /api/auth/login`
  (bcrypt compare + issue JWT), `GET /api/auth/me` (protected, exercises the
  auth middleware).
- `server/src/app.js` / `index.js`: Express app wired up with `express.json()`,
  `/health`, the auth routes, and the error handlers last. The HTTP server now
  starts listening immediately and connects to MongoDB in parallel (logged,
  not blocking) rather than gating startup on the DB connection — this also
  means `/health` and validation responses work even if Mongo is briefly down.
- Installed `express`, `mongoose`, `jsonwebtoken`, `bcrypt`, `express-validator`,
  `dotenv`. `bcrypt` (native, not `bcryptjs`) compiled/loaded fine — sandbox has
  a working C++ toolchain and bcrypt ships prebuilt binaries anyway.
- `.env.example` added (`PORT`, `MONGO_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`).

### Known issue / limitation

- **No MongoDB was reachable in this sandbox** — no local `mongod`, no package
  available via `apt`, `mongodb.org`/`fastdl.mongodb.org` blocked by the sandbox's
  proxy policy (403), and no Docker daemon running to pull an image. So: every
  route was tested end-to-end with curl (see below) except the actual
  DB-backed success path.
  - Tested and confirmed correct: `GET /health` (200), unmatched route (404),
    register validation errors (422, all four fields), login validation errors
    (422), `GET /api/auth/me` with no token (401) and a garbage token (401).
  - Tested with a valid register payload against the unreachable DB: the
    request does **not** crash the server — it returns a clean `500` once
    Mongoose's operation buffering times out (~10s), and the connection error
    is logged server-side, not leaked to the client. This confirms the
    middleware chain, validation, and error handling all work correctly; it
    does not confirm an actual successful write/read against a live database.
  - **First thing to do before Session 1D**: point `MONGO_URI` (in `server/.env`,
    gitignored, not committed) at a real MongoDB — Atlas free tier or a local
    `mongod` — and re-run the register → login → `/me` sequence with curl to
    confirm an actual document gets created and read back correctly.

### Session 1D — Auth flow, frontend (complete)

- `constants/config.js`: `API_BASE_URL` from `EXPO_PUBLIC_API_URL`, falling
  back to `http://localhost:4000/api`. Root `.env.example` documents it — for
  a real device you'll need your machine's LAN IP, not `localhost`.
- `services/api.js`: axios instance. Request interceptor attaches the
  SecureStore token as `Authorization: Bearer`. Response interceptor calls a
  registered "unauthorized" handler on a 401 **only when the failing request
  already carried an auth header** — so a wrong-password 401 on `/login`
  itself doesn't trigger a global logout, only an expired/invalid token on an
  authenticated request does.
- `utils/validation.js`: `isValidEmail`/`isValidPassword`, shared by both
  screens.
- `context/AuthContext.jsx`: on mount, loads any stored token and validates it
  against `GET /auth/me`; exposes `login`, `register`, `logout`,
  `isAuthenticated`, `isLoading`; registers itself as `services/api.js`'s
  unauthorized handler so a 401 anywhere clears the session automatically.
  Wired into `app/_layout.jsx` alongside `ThemeProvider`.
- `app/(app)/_layout.jsx`: now an auth guard — spinner while checking the
  stored session, `<Redirect href="/login" />` if unauthenticated, otherwise
  the tab navigator.
- `app/(auth)/login.jsx` and `register.jsx`: full inline validation (email
  format, required fields, password length, password-match on register),
  loading state on submit, server error message surfaced on failure,
  `router.replace('/')` on success so the auth guard takes over immediately.
- `app/(app)/profile.jsx`: shows the signed-in user, a destructive
  `ConfirmDialog`-gated "Log out" button, clears the session and
  `router.replace('/login')`.
- Installed `axios` and `expo-secure-store`.
- Validated with `npx expo export --platform ios` (clean bundle, 1142
  modules, zero errors) and a plain-Node check of the validation helpers.

### Known issue / limitation

- Same as Session 1C: **no live MongoDB in this sandbox**, so the full
  register → land on tabs → log out → log back in loop could not be run
  end-to-end here. The code path was validated by static bundling and by
  reading the request/response contract against the exact shape the backend
  returns (`{ token, user }`), but not exercised on a real device against a
  real database. This is the top priority to check before Session 2A: run the
  dev client against a real Mongo and walk through register → dashboard →
  profile → log out → log in.
- `EXPO_PUBLIC_API_URL` defaults to `http://localhost:4000/api`, which only
  works from a simulator on the same machine as the API. On a physical device
  or Android emulator you'll need to set it to your machine's LAN IP (or
  `10.0.2.2` for the Android emulator) in a local `.env`.

### Session 2A — App shell (complete)

- `context/ToastContext.jsx`: `ToastProvider` + `useToast()` →
  `showToast(message, type)`. Renders the `Toast` UI component at the root
  layout (above `AuthProvider`/the `Stack`), so a toast survives navigation
  instead of unmounting with the screen that triggered it.
- `app/(app)/_layout.jsx`: tabs now themed (active/inactive tint, background,
  border all from `useTheme()`) — still the navigator's default tab bar, no
  custom animation (cut from scope).
- `app/(app)/index.jsx`: home dashboard — greeting, a "No active journey"
  `EmptyState` with a "Start a journey" action (there's no journey feature
  yet, session 2D, so this is the honest empty state rather than mocked
  journey data), and a 2x2 quick-action grid (new journey / guardians / map /
  fake call).
- `app/(app)/profile.jsx`: initials avatar, name/email header, email/phone as
  list rows in a `Card`, logout now fires a success toast before redirecting
  to `/login` — a real demonstration that `ToastProvider` renders above
  whatever screen is currently active.
- Validated with `npx expo export --platform ios` (clean bundle, 1143
  modules, zero errors).

### Known issue / limitation

- Same as 1C/1D: no live MongoDB in this sandbox, so `user.name`/`user.phone`
  rendering on the dashboard/profile could only be verified against the
  API's response shape, not against a real logged-in session on a device.

### Session 2B — Contacts and guardians (complete)

- **Bug fix, found while testing**: `server/src/middleware/auth.middleware.js`'s
  `protect()` wrapped both `jwt.verify()` and the `User.findById()` DB lookup in
  one try/catch, so an unreachable/slow database surfaced as a misleading 401
  "Invalid or expired token" after a 10s buffering timeout instead of the real
  error. Fixed: only `verify()` failures produce that 401 now; a DB failure
  propagates to the normal error handler as a 500 with its real message.
  Confirmed with curl (see below) — this affects every protected route,
  including the auth routes from session 1C, not just guardians.
- `server/src/models/Guardian.js`: matches the data model spec — userId, name,
  phone, relation, isPrimary, contactId.
- `server/src/{validators,controllers,routes}/guardian.*`: full CRUD,
  protected and scoped to `req.user._id` — `GET/POST /api/guardians`,
  `PATCH/DELETE /api/guardians/:id`. Mounted in `app.js`.
- `hooks/useContacts.js`: requests contacts permission, loads device contacts
  with phone numbers, exposes `status/contacts/isLoading/error`.
- `services/guardians.js`: list/create/update/delete wrappers over the axios
  instance.
- `app/(app)/guardians.jsx`: full loading/error/empty/success states for the
  list. "Add a guardian" offers two paths — import from contacts (search,
  multi-select, a real permission-denied state with an Open Settings button)
  or manual entry — both feeding one edit/delete form with a primary-guardian
  toggle. Each row has direct tap-to-call and WhatsApp buttons via `Linking`
  (WhatsApp checks `canOpenURL` first and toasts if it's not installed).
- Installed `expo-contacts`, added its permission plugin config to
  `app.json`, re-ran `expo prebuild` to regenerate native projects with it.
- Validated with `npx expo export --platform ios` (clean bundle, 1157
  modules, zero errors).

### Known issue / limitation

- Guardian routes were tested the same way as the auth routes in 1C: with curl
  against the running server. All auth-guard behavior was confirmed —
  missing token → 401 on every route (list/create/update/delete), and (after
  the bug fix above) a valid token with the DB unreachable now correctly
  returns a clean 500 with the real Mongoose error instead of a false 401.
  What could **not** be tested here: an authenticated request actually
  reaching the controller and validators (every route requires `protect()`,
  which itself needs a DB lookup, so there's no way to reach guardian-specific
  validation errors without a live database) or the frontend contact-import
  flow (needs a real device with contacts and a live API). First things to
  check on a real device: permission-denied state, search/multi-select import,
  manual add/edit/delete, and call/WhatsApp buttons.

### Session 2C — Location and maps (complete)

- `hooks/useLocation.js`: requests foreground permission, reads last-known
  position immediately then current position, optionally watches position
  (`{ watch: true }` — for journey tracking in session 2D), cleans up the
  `watchPositionAsync` subscription in the `useEffect` return. Exposes
  `status/location/error/isLoading`.
- `app/(app)/map.jsx`: full loading/permission-denied/error/success states.
  Shows the user's live position (`showsUserLocation`), a destination search
  bar (`Location.geocodeAsync`) that drops a marker and reverse-geocodes it
  into a readable address card, and a recenter FAB
  (`mapRef.animateToRegion`).
- Installed `expo-location` and `react-native-maps`, added the location
  permission plugin config to `app.json`, re-ran `expo prebuild`.
- Validated with `npx expo export --platform ios` (clean bundle, 1200
  modules, zero errors).

### Known issue / limitation

- **Android needs a Google Maps API key that isn't set anywhere.**
  `react-native-maps` uses Apple Maps on iOS out of the box — no key needed,
  nothing to do there. On Android it needs a key from Google Cloud Console
  added to `app.json` as `expo.android.config.googleMaps.apiKey`, then
  `expo prebuild` re-run. Without it, the Android map screen will mount but
  show blank/greyed tiles. I didn't fabricate a placeholder key. **Do this
  before testing the map on Android.**
- Same sandbox limitation as every session so far: no device to actually see
  the map render, drop a pin, or watch permission prompts — validated by
  clean static bundling only. First things to check on a real device:
  permission-denied state, current-location marker, destination search, and
  the recenter button.

### Session 2D — Journeys (complete)

- `server/src/models/Journey.js`: matches the data model spec exactly —
  userId, guardianIds, status (active/completed/missed/sos), origin,
  destination, currentLocation, path, expectedArrival, checkInDeadline,
  startedAt, endedAt.
- `server/src/{validators,controllers,routes}/journey.*`: protected, scoped
  to `req.user._id`. `POST /api/journeys` verifies the chosen `guardianIds`
  actually belong to the user and derives `checkInDeadline` as
  `expectedArrival` + a 10-minute grace period (a judgment call — the two
  fields are distinct in the data model, so I picked a sensible default
  rather than making them identical; easy to change). `PATCH
  /api/journeys/:id/location` and `POST /api/journeys/:id/check-in` both
  reject a journey that isn't `active`. Mounted at `/api/journeys`.
- `hooks/useCountdown.js`: ticks every second off a target date, cleans up
  its interval in the `useEffect` return, returns an `mm:ss` label and
  `isOverdue`.
- `services/journeys.js`: list/get/create/updateLocation/checkIn.
- `app/journey/new.jsx`: destination search (same `Location.geocodeAsync`
  pattern as the map screen), guardian multi-select loaded from the backend
  (empty state pointing at `/guardians` if none exist), and an "I'll be back
  in" preset picker (15/30/45/60 min) instead of a raw date/time picker — no
  date-picker library is in the approved dependency list, and the brief's own
  wording ("I'll be back in 30 minutes") maps directly onto presets. Submits
  current position as origin, POSTs the journey, replaces into
  `/journey/[id]`.
- `app/journey/[id].jsx`: full-screen map with origin/current/destination
  markers and a path polyline. While active, `useLocation({ watch: true })`
  feeds each position to `PATCH .../location` — the hook's 10s watch interval
  is what satisfies the "PATCH every 10-15s" scope decision, no separate
  timer needed. The polyline renders directly from the response's `path`, not
  a separately-accumulated client array. A countdown and "Check in" button
  sit in a bottom panel — **this is a static, non-draggable Card, not an
  animated bottom sheet.** `react-native-reanimated` and a `Sheet` component
  aren't installed/built yet (deferred to whenever session 3B needs
  reanimated for the panic button); building a real gesture-driven sheet now
  would mean adding that dependency a phase early for one screen. Checking in
  flips the journey to `completed`, which stops the watch (the hook call is
  gated on `isActive`). A non-active journey renders the same screen
  read-only, without the timer/check-in.
- `app/(app)/index.jsx`: dashboard now fetches journeys on mount and on
  pull-to-refresh (`RefreshControl`). Shows a live active-journey card with
  its own countdown when one exists, otherwise the existing empty state. A
  "Recent journeys" list below shows past journeys with a status badge — a
  plain list, not paginated (cut from scope).
- Validated with `npx expo export --platform ios` (clean bundle, 1202
  modules, zero errors) and a standalone check of the countdown
  label-formatting logic.

### Known issue / limitation

- Same DB limitation as every backend session: journey routes were curl-
  tested for the auth guard (401 with no token, confirmed clean 500 — not a
  masked 401 — with a valid token against the unreachable DB) but the create
  → track → check-in flow itself needs a live database and a real device to
  exercise. First things to check on a real device, in order: create a
  journey end to end, confirm the map shows moving position updates roughly
  every 10s, confirm the polyline grows, confirm the countdown ticks and
  turns red when overdue, confirm check-in stops location updates and flips
  the dashboard card into journey history.
- The bottom panel on the tracking screen is a static Card, not a draggable
  animated sheet (see above) — a known, deliberate scope trim, not a bug.

### Session 3A — Camera and media (complete)

- `server/src/middleware/upload.middleware.js`: multer disk storage into
  `server/uploads/` (gitignored), filenames as `<userId>-<timestamp>.<ext>`,
  rejects non-image/video mimetypes and files over 50MB.
  `server/src/controllers/media.controller.js` + `routes/media.routes.js`:
  `POST /api/media` (protected), returns `{ url: "/uploads/<filename>" }`.
  Mounted at `/api/media`; `/uploads` served statically via
  `express.static`. `error.middleware.js` now formats `MulterError` as a 400.
  **This is the one backend piece verified with real, working I/O this
  build** — not just curl-against-a-401, actual disk storage: an isolated
  test harness (bypassing the DB-gated auth layer specifically to exercise
  the upload mechanism) confirmed a real file lands on disk with the correct
  size/mimetype, a disallowed file type is rejected with a clean 400, and the
  static route serves the uploaded file back byte-for-byte identical.
- `hooks/useCamera.js`: wraps `expo-camera`'s `useCameraPermissions` +
  `useMicrophonePermissions` (video needs both) into
  loading/granted/denied state, plus facing/torch/zoom as local UI state.
- `components/camera/CaptureControls.jsx` (flip, torch, zoom +/-, one
  capture button — tap for photo, hold for video with a recording
  indicator) and `MediaPreview.jsx` (full-screen image or `expo-av` video
  playback, Retake/Use, upload progress bar).
- `services/media.js`: `uploadMedia({ uri, type, onProgress })` — multipart
  `FormData`, progress via axios's `onUploadProgress`.
- `app/camera.jsx`: full permission/loading/denied/granted states, live
  `CameraView` or a gallery picker (`expo-image-picker`) as an alternative
  source, both landing in the same preview → retake/use → upload flow.
  **Compression** is handled by capturing/picking at `quality: 0.5` rather
  than a separate post-processing step — `expo-image-manipulator` isn't in
  the approved dependency list, and controlling quality at the capture
  source is a legitimate, simpler approach than compressing afterward.
  Wired to a temporary "Camera" quick action on the dashboard so it's
  reachable and testable now; session 3B's panic button will likely become
  the real entry point.
- Installed `expo-camera`, `expo-image-picker`, `expo-av`, and (server-side)
  `multer`. Added camera/microphone/photo-library permission plugin config
  to `app.json`, re-ran `expo prebuild`.
- Validated with `npx expo export --platform ios` (clean bundle, 1233
  modules, zero errors).

### Known issue / limitation

- `expo-av` resolved to `16.0.8` (its own independent versioning, not tied to
  the SDK 57 bundle the way `expo-camera`/`expo-image-picker` are) — it
  installed and imports cleanly, but it's the one dependency this session
  that isn't officially "SDK-blessed" for this Expo version anymore (Expo's
  own direction is `expo-video`/`expo-audio`). It's used here only for video
  *preview playback*, the narrowest possible use. Worth a real device check
  first, and worth knowing this is a future migration point if `expo-av`
  stops being maintained.
- Same sandbox limitation as every session for anything needing a device:
  camera/gallery permission prompts, actual capture, recording, and playback
  are all unverified beyond clean bundling — there's no camera or gallery in
  this sandbox at all, so unlike location/contacts this could never have been
  curl-tested even indirectly. First things to check on a real device: photo
  capture, hold-to-record video with playback, flip/torch/zoom, gallery
  picker, and a real end-to-end upload against a live backend.
- Tap-to-focus from the original brief wording is not implemented as literal
  tap-to-set-focus-point — `expo-camera`'s `CameraView` doesn't expose a
  simple focus-at-point API in this version. Zoom and flip are real; treat
  "tap-to-focus" as not covered rather than assuming it works.

### Session 3B — Safety features (complete)

- `server/src/models/Incident.js` + `{validators,controllers,routes}/incident.*`:
  matches the data model spec (userId, journeyId nullable, type
  sos/unsafe_spot, location, mediaUrls, note, createdAt). Protected, scoped
  to `req.user._id`. Mounted at `/api/incidents`. Only `sos` is ever actually
  created — `unsafe_spot` stays a valid schema value for the community map,
  which is cut from this build's scope.
- `components/journey/PanicButton.jsx`: hold-to-activate, 1.4s radial fill
  (`react-native-reanimated`, a scaling circle) with a haptic ramp (light on
  press, medium at 50%, heavy at 85%, a warning notification on completion).
  Releasing early cancels the animation and haptic timers cleanly.
- `app/incident/new.jsx`: the button's actual target. Gets the current
  position, captures a photo the instant the camera reports genuinely ready
  (not just mounted — this was a real bug I caught and fixed before
  committing: the original draft polled `cameraRef.current` truthiness,
  which is true as soon as the component mounts, not when the native preview
  can actually take a picture; fixed to poll a `cameraReadyRef` set from
  `onCameraReady`), uploads it, and creates the incident behind a single
  "Sending SOS…" screen — no manual preview/confirm step. Falls back
  gracefully to location-only if camera permission is missing or the photo/
  upload step fails; never blocks the alert on media.
- `app/incident/[id].jsx`: replaces the phase-0 placeholder — shows the
  attached photo, location, timestamp, and note, with loading/error/retry.
- `hooks/useShakeDetector.js`: `expo-sensors` Accelerometer polled at 100ms,
  fires on a magnitude threshold with a 3s cooldown, unsubscribes in the
  `useEffect` return. Foreground-only like the rest of the app's location
  work — no true lock-screen shake detection without background execution,
  which this build deliberately doesn't have.
- `app/fake-call.jsx`: real incoming-call UI — looping ringtone (a
  synthesized two-tone WAV, see below) plus a repeating vibration pattern,
  both cleaned up on unmount/answer/decline. Answer moves to a believable
  in-call state with a duration timer instead of just closing, in case
  someone actually holds the phone to their ear.
- `PanicButton` + `useShakeDetector` wired into the home dashboard (always
  on) and the active-journey tracking screen (prominent SOS over the map,
  only while active) — both pass the active journey's id through so the
  incident links to it.
- `assets/sounds/ringtone.wav`: synthesized locally with a small Node script
  (two alternating tones, faded edges) since no real ringtone asset was
  available and fetching one from the internet wasn't an option here.
- Installed `react-native-reanimated` (plus its `react-native-worklets` peer
  dependency — v4's new architecture needs it directly, not just via
  `expo-router`'s own internal use of it), `react-native-gesture-handler`,
  `expo-haptics`, and `expo-sensors`. Added the motion permission plugin
  config to `app.json`, re-ran `expo prebuild`.
- Validated with `npx expo export --platform ios` (clean bundle, 1619
  modules, zero errors, ringtone asset correctly picked up) — this caught
  the missing `react-native-worklets` dependency before it ever reached you.

### Known issue / limitation

- **`expo-sensors` was not on the originally approved dependency list.**
  Shake-to-alert is explicitly in scope and there's no way to read device
  motion without some sensors API — this is the official Expo module for it,
  not a third-party pick. Flagging it here since the working agreement asks
  me to check before adding unlisted dependencies; given the standing
  instruction to keep moving toward the deadline without stopping to ask, I
  judged this a safe, necessary, and reversible addition rather than pausing
  the build on it.
- `react-native-gesture-handler` is installed (it was bundled into this
  session's dependency batch since it's the conventional pairing with
  reanimated) but nothing in the app actually imports it yet — the panic
  button's hold gesture uses plain `Pressable`. Not a problem, just worth
  knowing it's currently dead weight; leave it, since `expo-router`/
  `react-navigation` want it present regardless.
- Same no-device limitation as sessions 3A and earlier: hold-to-activate feel,
  haptic ramp, the actual radial fill animation, shake detection sensitivity,
  ringtone/vibration on a real phone, and the full panic → photo → upload →
  incident round trip against a live database are all unverified beyond
  clean bundling and the code-level bug fix caught above. First things to
  check on a real device, in order: hold the panic button to completion and
  confirm the incident screen shows a real photo and location; shake the
  phone and confirm the same flow fires; trigger the fake call and confirm
  ringtone + vibration actually play and stop correctly on answer/decline.

### Session 3C — Final pass (complete)

This was run back-to-back with sessions 3A/3B/3C after you told me to complete
the project autonomously without stopping to ask before each session or each
push — noted here since it breaks from the "one phase per session" pacing the
brief originally asked for. No scope was skipped as a result; if anything,
running straight through gave more room for the bug-fix sweep below.

- **Bug-fix sweep found and fixed two real issues** before they'd have hit you
  on a device:
  1. `app/camera.jsx`: `CameraView`'s `mode` prop was being flipped to
     `'video'` via `setState` *immediately before* the `recordAsync()` call
     that needs it — but that state update hadn't committed to the native
     view yet at that point, so recording likely started while the camera
     was still configured for stills. Fixed by switching mode eagerly on
     press-in (`onCapturePressIn`, wired through `CaptureControls`), well
     before the long-press threshold resolves, giving the native side the
     full delay to reconfigure.
  2. `services/media.js`: the upload request manually set
     `Content-Type: multipart/form-data` with no boundary, which can
     override React Native's automatic boundary computation for `FormData`
     bodies and produce a request the server can't parse. Removed the
     header override — this is exactly the kind of thing curl-testing
     against the backend couldn't have caught, since curl sets its own
     correct multipart header regardless of what the app code does.
  Also reconsidered `ErrorBoundary`'s placement mid-build: it wraps just the
  navigator, inside the Theme/Toast/Auth providers, not the whole app —
  wrapping everything would mean "Try again" on a crash also wiped the
  logged-in session and theme, which is worse than the crash.
- `components/ErrorBoundary.jsx`: class component (required for
  `getDerivedStateFromError`/`componentDidCatch` — no hook equivalent),
  fallback screen with a retry button, hardcoded colors since it must
  render even if the crash originated inside `ThemeProvider`.
- **App icon and splash**: generated from scratch — a compass mark (matching
  the app's own 🧭 identity used throughout the UI) on the brand blue,
  produced by a ~150-line local script writing raw PNG bytes (IHDR/IDAT/
  IEND chunks, zlib deflate, hand-rolled CRC32) since no image tooling
  (ImageMagick, sharp, PIL) was available in this sandbox and there was no
  existing icon asset to start from. Covers the iOS icon, all three Android
  adaptive-icon layers (foreground/background/monochrome), and the web
  favicon. Installed `expo-splash-screen` and configured light/dark
  background variants with the same mark.
- **Offline handling**: interpreted narrowly, matching scope — "offline
  queue" (queuing actions taken while offline for later sync) is explicitly
  cut per the compressed plan's own cut list. What exists is what every
  screen already had: a failed request lands in that screen's existing
  error/retry state. No new offline-specific code was added; this is a
  scope interpretation worth double-checking against what you actually
  wanted here.
- **README rewritten** end to end: feature coverage table, full setup for
  both app and server (env vars, the `EXPO_PUBLIC_API_URL` cases, the
  Android Google Maps key requirement), architecture notes, every scope
  decision made across all ten sessions in one place (including the two
  dependency deviations and — the most important one to read — the missing
  guardian-notification gap), and an honest testing section.
- **No screenshots in the README.** The checklist asks for them; I have no
  device or simulator in this sandbox to produce real ones, and generating
  fake screenshots of a safety app would be actively misleading. Flagging
  the omission rather than filling it with something fabricated — add real
  ones after the first device run.
- Final validation: `npx expo export` for **both** `--platform ios` and
  `--platform android` (clean, 1620 and 1713 modules respectively, zero
  errors — this is the first session that checked Android specifically, not
  just iOS), `expo prebuild` regenerating native projects cleanly, and a
  full route-by-route curl sweep of the backend (health check, every
  protected route rejecting a missing token, register/login validation, 404
  handling) all passing.

### The one thing most worth reading before you do anything else

**Guardians never actually get notified of anything.** The product pitch —
and the UI's own language in places — implies that starting a journey shares
it with your guardians and that missing a check-in alerts them. Neither is
true in this build: there's no push notification, SMS, or any other channel
that reaches a guardian's phone. A missed deadline just turns the countdown
red on *your own* dashboard. `expo-notifications` was on the approved stack
but nothing in the 3-day checklist's line items actually specified building
guardian-facing notifications, so it was never implemented. This is flagged
in the README's scope-decisions section too, but it's the single biggest gap
between what this app appears to do and what it actually does — read it
there for the full context before demoing or relying on this.

## Overall status

Every item in the original feature checklist (Camera, Location, Contacts,
Media, Backend, Expo Router, UI/UX) has a working implementation as of this
session. Nothing has been run on a real device or against a live MongoDB —
every session's validation was static bundling (`expo export`) plus curl
against the backend, which caught two real bugs (the auth-middleware
DB-error-masking bug in session 2B, and the two bugs in this session) but
cannot substitute for actually running the app. The next step, whenever you
pick this back up, is exactly what's in the README's Testing section: point
`MONGO_URI` at a live database, run the app on a real device or simulator,
and walk through register → journey → panic button → fake call end to end.
