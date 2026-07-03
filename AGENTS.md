# CloakBrowserDesktop

## What this is

Electron desktop app for managing isolated browser environments powered by [CloakBrowser](https://github.com/CloakHQ/CloakBrowser). Local Express API (`:6788`) backed by SQLite manages profiles; React renderer talks to the API via fetch.

## Commands

| Action | Command |
|--------|---------|
| Dev server (hot reload) | `npm run dev` |
| Preview build | `npm run start` |
| Build (typecheck + bundle) | `npm run build` |
| Typecheck only | `npm run typecheck` |
| Typecheck node/main side | `npm run typecheck:node` |
| Typecheck renderer side | `npm run typecheck:web` |

There is no linter or formatter configured. `npm run build` is the primary verification gate.

Tests use Node's built-in test runner with `--experimental-strip-types` to run `.test.mjs` files that import TypeScript directly (no compile step). CI runs `npm test` before `npm run build`.

## Architecture

```
src/
  main/            # Electron main process (Node)
    index.ts       # App entry, window creation, IPC handlers
    server/        # Express API (runs inside main process)
      app.ts       # Server lifecycle (port 6788)
      db/          # SQLite via better-sqlite3
      profile/     # Profile CRUD store
      session/     # Browser session manager (open/close CloakBrowser)
      routes/      # Express routers
    kernel-releases.ts  # Kernel version management
    workspace-paths.ts  # User data directory config
  preload/         # contextBridge: exposes ipcRenderer to renderer
  renderer/        # React SPA
    src/
      App.tsx      # Root component, page routing
      request.ts   # API client (profileApi)
      types.ts     # Shared TypeScript interfaces
      hooks/       # React hooks (use-profiles, use-mobile)
      components/  # Page components + shadcn/ui components
      lib/utils.ts # cn() utility for className merging
```

## Path aliases

Defined in both `tsconfig.node.json` and `tsconfig.web.json`:

- `@main/*` → `src/main/*`
- `@/*` → `src/renderer/src/*` (also `@renderer/*`)
- `@preload/*` → `src/preload/*`

## Key patterns

- **API communication**: Renderer calls `fetch()` to `http://127.0.0.1:6788/api/...`. Base URL comes from `window.appInfo.apiBaseUrl` set in preload. All responses follow `{ code, msg, data, succeed, timestamp }` shape.
- **IPC**: Main↔renderer via `ipcMain.handle` / `ipcRenderer.invoke`. Preload exposes typed wrappers on `window.appWindow`, `window.kernelReleases`, `window.workspace`.
- **Database**: SQLite at `<userData>/cloak-browser-app.sqlite` with WAL mode. Schema migrations are inline `ALTER TABLE` checks.
- **Native modules**: `better-sqlite3`, `cloakbrowser`, `playwright-core` are unpacked from asar (`asarUnpack` in electron-builder.yml).
- **Environment**: `.npmrc` sets `electron_mirror` to npmmirror.com (China) and `shamefully-hoist=true`. The `CLOAKBROWSER_CACHE_DIR` env var is set at runtime by `workspace-paths.ts`.

## Build & packaging

- `electron-vite build` outputs to `out/` (main → `out/main/index.cjs`, preload → `out/preload/`, renderer → `out/renderer/`)
- `electron-builder` packages from `out/` + `build/` resources
- Build requires typecheck to pass first (`npm run build` chains them)

## Conventions

- UI language is Chinese (zh-CN). All user-facing strings, error messages, and comments are in Chinese.
- shadcn/ui components in `src/renderer/src/components/ui/` with `new-york` style variant.
- Tailwind CSS v4 via `@tailwindcss/vite` plugin (not the PostCSS plugin).
- Component library: `radix-ui`, `lucide-react` icons, `sonner` for toasts.
- `class-variance-authority` + `tailwind-merge` via `clsx` for className composition.
- Window is frameless (`frame: false`) with custom titlebar component.
- Profile IDs are generated strings; user data directories are `<profilesDirectory>/<id>/`.
- i18n is inline in `src/renderer/src/i18n.tsx` with `zh-CN` and `en` dictionaries. Use `useI18n()` hook and `t('key')` for translations.

## Gotchas

- `postinstall` runs `electron-builder install-app-deps` to rebuild native modules for Electron's Node version.
- The Express server starts during window creation (`createWindow`) and stops on `before-quit`.
- Profile deletion validates that the target path basename matches the profile ID before removing (`profileStore.ts:148`).
- There are no automated tests. `scripts/profile-delete-regression.ps1` is a manual PowerShell regression script.
- No `.env` file is committed; `.env` is gitignored.
