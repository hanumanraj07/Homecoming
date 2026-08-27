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

## Next step

**Session 1C**: Express + MongoDB backend — server setup, `User` model,
register/login routes, bcrypt password hashing, JWT auth middleware, input
validation (express-validator), centralized error handler, `.env.example`. Test
every route with curl before committing. This is server-only work; the
`server/` package scaffolded in 1A still has no dependencies installed.
