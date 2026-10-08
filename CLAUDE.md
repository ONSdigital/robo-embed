# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A SvelteKit 2 / Svelte 5 template for semi-automated ("robo-journalism") area content that is embedded in an ons.gov.uk article with an iframe (pym.js). A Pug template and a wide CSV (one row per area) are rendered ahead of time into one JSON file per area. Unlike [robo-article](https://github.com/ONSvisual/robo-article), which prerenders a page per area, the app is a single page that loads an area's JSON when it is selected. Templates are usually written in [robo-editor](https://onsdigital.github.io/robo-editor/).

## Commands

```bash
npm run build:data      # render demo-data/ (or the source in app.config.js) into static/data/
npm run dev             # dev server at localhost:5173 (localhost:5173/iframe.html shows it in an iframe)
npm run build           # production build to build/, then js-fix
npm run build:preview   # preview build: a single 404.html with base_preview
npm run lint            # prettier --check
npm run format          # prettier --write
```

There are no tests. `static/data/json/` and `static/data/places.csv` are generated and gitignored, so run `build:data` before `dev` or `build` on a fresh checkout. `package-lock.json` is also gitignored, so a clean install can pick up newer `@onsvisual/*` libraries within their semver ranges.

Formatting (`.prettierrc`): tabs (width 4), print width 100, no trailing commas, matching robo-utils. The boundary files and base map style in `src/lib/` are excluded.

## Architecture

**Data build (Node, `scripts/build-data.js`).** Reads the CSV and Pug template named in `src/app.config.js`, keeps rows whose code prefix is in `filter`, and for each area (plus `null`, meaning no area selected) calls robo-utils' `renderJSON`. It writes `static/data/json/<areacd>.json` (and `default.json`), plus `static/data/places.csv` with only the `cols` columns, which powers the area search and the list of all areas. Template changes need a `build:data` rerun. After a run where every page rendered without a Pug error, it deletes JSON files for areas that are no longer in the data; it prints a summary and exits with code 1 if any page failed.

**Selecting an area.** `src/routes/+page.js` loads `places.csv` and `default.json` (whose `Meta` section sets the page title and analytics props). `+page.svelte` keeps the current area's JSON in `place` (a writable `$derived` of `data.place`) and replaces it in `doSelect()`, from the search box, the list of all areas or "Clear selected area". On load, svelte-components' `Embed` reports the parent page's URL, and an area code in its hash (eg. `#E08000035`) selects that area, so the parent article can link to an area.

**Chart embeds.** `src/routes/embed/` shows a single chart for the embed codes from `ChartActions.svelte`, chosen at runtime with `?area=<areacd>&chart=<section id>`. Nothing links to it, so it is listed in the prerender `entries` in `svelte.config.js`.

**Section types.** The rendered JSON is `{ sections, ... }`, where each top-level Pug `section` has its class as `type`. `+page.svelte` switches on it: `Meta`, `Header` (with the area search), `Highlight`, `Chart` (needs a `chartType` prop; drawn by `@onsvisual/svelte-charts`' `Chart`), `Summary` (nested sections become `SummaryItem`s), `Warning`, `Map`, and anything else as a plain `Section` with HTML content. A new section style in a template needs a branch here.

**Map (`src/lib/layout/RoboMap.svelte`).** Uses `@onsvisual/svelte-maps` (2.x, MapLibre 6; `RoboMap` sets up its worker script) with TopoJSON boundaries bundled from `src/lib/boundaries/` (2024 local authorities, and regions plus Northern Ireland, Scotland and Wales) and the base style in `src/lib/mapstyles/`. The `Map` section's `data` (`x` values keyed by `areacd`) is coloured with equal-interval breaks, and the map zooms to the region in `regioncd`. Areas missing from the boundary files aren't drawn.

**Base paths.** `base_prod` and `base_preview` in `src/app.config.js` set `paths.base`: a path builds absolute URLs, and `null` builds relative ones, so the app can be deployed to any path. The chart embed codes in `ChartActions.svelte` need absolute URLs, so they're built from `app_url` in the same file, which doesn't affect the build; don't build them from `resolve()`/`asset()`, which return relative paths in a relative build. In dev there's no base. Use `asset()` for files in `static/` and `resolve()` for routes, from `$app/paths` (not the deprecated `base`). `scripts/js-fix.js` prepends `//js` to every JS file in `build/_app` to avoid MIME type errors on the ONS servers.

**Preview builds.** `npm run build:preview` sets `PUBLIC_APP_ENV=preview`, which uses `base_preview` and turns prerendering off (in `src/routes/+layout.js`). The build is then a single `404.html` fallback page (adapter-static's `fallback` in `svelte.config.js`) that renders every route in the browser, plus the JS chunks, data and static files. `static/web.config` makes our internal IIS server use `404.html` for any unknown URL (and as the default document), so links to any route work. Don't add `export const prerender = true` to individual routes, or preview builds will prerender them again.

**Components.** The UI comes from `@onsvisual/svelte-components`, which is still written in Svelte 4 syntax. Its components dispatch events, so listen with `on:click` / `on:load` on them, while the app's own components and DOM elements use runes and `onclick`. Its `Select` creates its input asynchronously, so `#select` may not exist yet when the page loads.
