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

## Next step

**Session 1B**: `constants/theme.js` (light + dark tokens, spacing, typography,
radii, shadows), `ThemeContext` with persisted toggle, and the lean `ui/` library
(Button, Input, Card, EmptyState, Toast, ConfirmDialog, ListItem, Badge, FAB — 9
components, no showcase screen per the compressed scope).

Before starting: run `npx expo run:ios` (or `run:android`) on a real machine to
confirm the dev client actually launches — the sandbox could only verify the
bundle compiles, not that it boots on device.
