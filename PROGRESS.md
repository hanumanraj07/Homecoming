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

## Next step

**Session 1D**: Auth flow (frontend) — login and register screens with full
form validation and inline errors (using the `Input`/`Button` components from
1B), `AuthContext`, SecureStore token storage, an axios interceptor with 401
handling, the protected `(app)` route group, `router.replace()` after login,
and logout with a confirm dialog (`ConfirmDialog` from 1B). Needs
`services/api.js` (axios instance) and `constants/config.js` (API base URL) —
neither exists yet.
