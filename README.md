<div align="center">

# 🧭 Choice Path Studio

**One choice opens another little path.**

![Vue](https://img.shields.io/badge/Vue-3-42b883?style=for-the-badge&logo=vuedotjs&logoColor=ffffff)
![TypeScript](https://img.shields.io/badge/TypeScript-6-3178c6?style=for-the-badge&logo=typescript&logoColor=ffffff)
![Vite](https://img.shields.io/badge/Vite-8-646cff?style=for-the-badge&logo=vite&logoColor=ffffff)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06b6d4?style=for-the-badge&logo=tailwindcss&logoColor=ffffff)
![License](https://img.shields.io/badge/License-MIT-777777?style=for-the-badge)

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new)

_Vue branching scene editor with independent nearest-provider journeys, typed readonly injection contracts, validated destinations, and Markdown/JSON exports._

</div>

---

## ✨ Highlights

- **A little branching story:** Connect 1–12 scenes with up to four labeled choices each.
- **Two independent visitors:** Try different paths side by side; each runner provides its own typed journey context.
- **Readonly state, explicit actions:** Nested views inject their nearest provider and call Choose, Back, and Restart operations.
- **A connected graph:** Validate every choice destination and starting scene before saving/importing.
- **Understand its shape:** Count endings, report unreachable scenes, and show incoming references before deletion.
- **Cycles with a bound:** Permit loops while limiting each visitor to 50 decisions in one pass.
- **A portable plan:** Export complete scene text, choices, and endings as escaped Markdown or canonical JSON.

## 🧱 Project Structure

```text
public/
├── favicon.svg                         # Original project emblem
├── og.svg                              # Original social artwork
├── font-licenses.txt                   # Font copyright and OFL licenses
└── sample-workspace.json               # Complete importable workspace
src/
├── components/
│   ├── JourneyRunner.vue
│   ├── JourneyScene.vue
│   ├── JourneyChoices.vue
│   ├── DataTools.vue                   # Workspace actions and restoration
│   ├── AppDialog.vue                   # Native Teleport modal and focus lifecycle
│   ├── AppIcon.vue                     # Original inline SVG icons
│   ├── DataExchange.vue                # Validated workspace import dialog
│   └── StudioHeader.vue                # Workspace branding and actions
├── domain/
│   ├── paths.ts                       # Pure validation, calculations, and exports
│   ├── shared.ts                       # Project-specific text and identity helpers
│   └── validation.ts                   # Strict unknown-input guards
├── composables/
│   └── journey.ts
├── services/
│   ├── draft.ts                        # Validated device-local persistence
│   └── files.ts                        # Downloads and deterministic identities
├── App.vue                             # Workspace and editor state
├── base.css                            # Tailwind, local fonts, and control defaults
├── style.css                           # Project theme tokens
└── main.ts                             # Vue application entry
tests/
├── *.test.ts                           # Native domain/composable/export tests
└── e2e/                                # Production browser workflows
```

Root files include Vite, TypeScript, Playwright, and Prettier configuration, an npm lockfile, the MIT license, and explicit `vercel.json`. The official scaffold’s default artwork and empty `src/assets` directory are removed. The shared generic development container stays unchanged.

## 🛠 Tech Stack

| Tool                          | Role                                                                        |
| ----------------------------- | --------------------------------------------------------------------------- |
| Vue 3.5                       | Typed SFCs, component contracts, reactive state, and lifecycle management   |
| TypeScript 6                  | Checked domain structures and component/composable inputs                   |
| Vite 8                        | Development server and static production bundles                            |
| Tailwind CSS 4                | Vite plugin, theme tokens, template utilities, and responsive/state styling |
| DM Sans + Bricolage Grotesque | Locally bundled Latin variable fonts                                        |
| Node.js 24+                   | Local CLI tools and native TypeScript tests                                 |
| Playwright                    | Chromium workflows against the production build                             |

The app requires no account, backend, remote data source, or extra UI library. All dependencies and CLI tools are installed locally inside this independent project.

## 🎨 Tailwind Styling

The Vite config enables `@tailwindcss/vite`. `base.css` imports Tailwind, defines font tokens, and uses `@apply` for small native control defaults. `style.css` defines project colors through `@theme`. Actual application templates use Tailwind utilities for grid/flex layouts, spacing, typography, borders, colors, responsive behavior, focus, and visible states.

`data-ui`, `data-project`, and domain identity attributes are explicit browser hooks. There are no orphan semantic styling classes. Reserved preview/list containers and internal overflow keep neighboring panels stable when modes, selected details, or results change. All application layout and visible-state classes use Tailwind utilities; portable text formats carry no application styles. Reduced-motion preferences shorten transitions.

Two Fontsource variable font files are bundled as hashed local assets. Their copyright and OFL text are in [font-licenses.txt](./public/font-licenses.txt). Favicon/social artwork and SVG interface icons are original project assets.

## 📦 Included Demo Data

The fictional **A slow Saturday in the neighborhood** journey offers the river path or a market visit, leading to a garden, a quiet book, or breakfast at home. Its six scenes are initially reachable, with three endings. Both visitor previews start at A free morning.

The complete [sample-workspace.json](./public/sample-workspace.json) includes valid provenance and is served as a public static file. The same canonical sample is defined in the domain module for first use and confirmed restoration.

## 🚀 Local Development

Use Node.js **24 or later**:

```bash
npm ci
npm run dev
```

Vite prints the local URL and binds to `0.0.0.0` for the shared container. Inspect a production bundle with:

```bash
npm run build
npm run preview
```

## 🧩 Vue Implementation

[`JourneyRunner.vue` provides a typed local context](https://vuejs.org/guide/components/provide-inject.html#working-with-reactivity) through a shared `InjectionKey`. Every runner calls `createJourney` separately and owns a private visited-path ref. The contract exposes a readonly path, computed current/finished/limited states, and explicit Choose/Back/Restart functions.

`JourneyScene.vue` and the more deeply nested `JourneyChoices.vue` inject the nearest runner context instead of receiving mutable parent state or a forwarded action prop chain. The same consumer components render twice under different providers, preserving each visitor’s path independently. The readonly path prevents consumers from bypassing the validated transition operations.

A getter-based `toRef` exposes the runner’s current workspace prop to its state composable. A synchronous watcher restarts the local path when a complete validated workspace replacement arrives. Saving scene/journey changes therefore refreshes both previews immediately; merely selecting a scene or typing in an unsubmitted form does not alter their paths. Vue owns each setup watcher’s component lifetime.

The pure schema validates identities, one existing start, and all destination references. A bounded graph traversal finds reachable scenes; incoming references explain why a scene cannot yet be removed. The editor only deletes an unreferenced non-start scene after confirmation. Cycles and graphs without an ending are valid, with an explicit 50-decision per-visitor bound and Back/Restart recovery.

The shared modal uses `Teleport`, a unique `useId` heading, and a post-flush watcher to synchronize Vue state with native `showModal`/`close`. Escape and focus return remain native. A queued close event cannot reset a modal that has already reopened.

## 💾 Local Drafts & Data Exchange

Validated workspace data is stored under `vue-choice-path-studio:v1`. First-use and restored data are validated before use. Invalid saved JSON/schema falls back to the sample without immediately overwriting the damaged entry. A later valid change writes a new draft. Blocked storage leaves editing and downloads usable and shows a status message.

Import parses a detached candidate and replaces the workspace only after complete validation. Failure keeps current work and the saved draft intact. Workspace JSON is limited to **120,000 characters**. Known fields are rebuilt in canonical order; unknown fields and supplied provenance are not trusted or carried into the editable domain. Project markers are recomputed from validated data. Session-only selection, modes, pending forms, dialog text, and derived results are not exported as workspace state.

| Field                 | Accepted values                                                            |
| --------------------- | -------------------------------------------------------------------------- |
| `version`, `name`     | `1`; nonblank single-line journey title up to 80 characters                |
| Starting scene        | Safe identity naming an existing scene                                     |
| Scenes                | 1–12 entries with safe unique identities                                   |
| Scene title / body    | Nonblank single-line title up to 60 characters; plain text up to 1000      |
| Choices               | 0–4 per scene, with unique IDs within that scene                           |
| Choice label / target | Nonblank single-line label up to 60 characters; an existing scene identity |

Zero choices makes a scene an ending. Scene text allows ordinary line breaks and tabs, normalised to LF. Reserved prototype identities, missing destinations/start, duplicate IDs, incorrect primitives, and excess collections are rejected.

Markdown includes the journey name, start scene, every scene identity/title/body, each labeled destination with its scene name/identity, explicit ending text, and CH attribution. User Markdown formatting characters are escaped. JSON retains the complete graph and provenance. Visitor paths, decisions, selected editor scene, pending fields, and preview state are session-only and excluded.

Download Blob URLs are revoked after download. Destructive collection removal, sample restoration, and pending-text replacement where applicable use native confirmation dialogs.

## ◈ Project Markers

- `CH` appears in the wordmark, project metadata, and workspace identity; original favicon/social artwork use its matching emblem.
- `CH-XXXXXXXX` is a deterministic 32-bit content stamp calculated from the canonical validated workspace, excluding supplied provenance.
- JSON provenance includes the project slug, `CodeSculptor`, and the marker. Downloaded artifacts carry the appropriate identity in filenames and/or metadata/content.
- Markers help identify configurations and artifacts; they are not cryptographic signatures or tamper-proof authorship claims.
- Author metadata and the MIT license retain CodeSculptor attribution.

## 🧭 Extension Notes & Nuances

- The graph is a local authoring/prototyping tool, with manually written scenes and choices; it does not generate stories or publish a playable hosted game.
- Both visitors read one edited graph and keep independent transient paths. Valid graph/title changes restart both contexts; selection alone does not.
- A path stores visited scene IDs, including repeats. After 50 choices it stops accepting further choices until the visitor steps back or restarts.
- Unreachable scenes remain editable/exportable. Ending counts include the entire graph, not only reachable scenes.
- Self-loops, other cycles, and no-ending graphs are allowed. The decision cap bounds preview history rather than changing graph structure.
- A referenced/start scene cannot be deleted directly. Remove its incoming choices and set another start first; deleting unsubmitted choices only changes the form until Save scene.
- There are no conditional rules, variables, scores, random transitions, or saved visitor progress in this version.
- Extend schema, transition actions, context contract, diagnostics, and portable Markdown together when adding behavior.

The application and documentation are English. At 320 px panels stack, while larger screens use the shared grid. Scrollable data regions, named native controls, visible focus styles, and a single main landmark remain available across layouts.

## ✅ Build & Checks

```bash
npm run build
npm run format:check
npm test
npx playwright install chromium
npm run test:e2e
```

`build` runs `vue-tsc` before Vite. Native tests use Node’s built-in runner. Playwright starts the current production bundle with the local preview command and does not reuse another server. Build before browser tests so they inspect current output. `npm run format` formats maintained source; dependencies, generated output, lockfiles, and browser artifacts are excluded.

Six native tests cover canonical detached graph data, strict targets/identities, bounded cyclic reachability/incoming edges, actual independent readonly Vue contexts and prop replacement, the 50-decision/back/restart bound, and complete escaped Markdown. Four domain browser workflows exercise the real nearest-provider consumers, independent choices/backtracking, graph-save resets, guarded/confirmed scene removal, cyclic decision limits, stable previews, edited choices, and actual Markdown downloads.

Shared browser workflows check valid/failed imports, persistence after reload, provenance downloads, blocked/corrupt storage, confirmed sample restoration, native modal reopening/Escape/focus, real Tailwind grid behavior, named visible controls, and overflow at 320–1440 px. A separate maximum-content case downloads and re-imports the full JSON workspace at 320 px. These are local production checks, not a deployed Vercel smoke test.

## ▲ Vercel Deployment

1. Import the repository and select this project folder as the Root Directory when deploying from the shared workspace.
2. Use the committed config: `npm ci`, `npm run build`, and output folder `dist`.
3. Check the root page, public sample/artwork, and main editor after deployment.

The explicit `vercel.json` rewrites only `/` to `/index.html` and permanently redirects `/index.html` to `/`. There are no client routes requiring a catch-all rewrite. Declared routes preserve missing-resource behavior. HTML and unhashed public files revalidate; Vite’s hashed JS/CSS/font assets receive one-year immutable caching. All responses include `X-Content-Type-Options: nosniff` and `Referrer-Policy: strict-origin-when-cross-origin`. The dev command accepts Vercel’s `$PORT` with `--strictPort`.

Used fields, route compilation, and generated asset/cache behavior are checked locally against the [official Vercel configuration schema](https://openapi.vercel.sh/vercel.json). Vite preview does not emulate deployment headers. SVG social artwork is included as an editable source; platforms requiring raster cards need a rendered image and an absolute deployed image URL.

## 📄 License

[MIT](./LICENSE) · Copyright (c) 2026 **CodeSculptor**. Bundled fonts retain separate OFL licenses.
