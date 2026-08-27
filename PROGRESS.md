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

## Next step

**Session 2C**: Location and maps — permission handling, current + last known
position, map screen with markers (`react-native-maps`, not installed yet),
recenter button, reverse geocoding, destination search, `useLocation` hook
with correct cleanup in the `useEffect` return (no background location — that
scope decision is already documented in the README).
