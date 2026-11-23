# Changelog

All notable changes to this project are documented in this file. The format
follows a keep-a-changelog style and the version numbers follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.0.0

### Milestone 16 — Performance Stress Test Examples (T74–T76)

- **Storybook "Performance" section** (`examples/stories/performance/stress-test.stories.tsx`,
  story `performance-stress-test--heavy-field`): a heavy animated field where one
  shared `Animation.from` definition (infinite-alternate pulse, deterministic
  per-element phase offsets via `seek`) drives hundreds of independent
  playbacks — all scheduled by the library's single centralized frame loop (§16).
  A `count` arg sets the starting element count; +10 / +100 / custom-count
  buttons attach new elements live without recreating running playbacks, and
  "clear all" disposes every playback (no leaked scheduled units, §12). The
  shared `Transport` chrome drives all playbacks through one synthesized
  fan-out `PlaybackHandleLike`, and a story-side rAF measurement loop reports
  element/running counts plus measured FPS and average frame time; counts sync
  immediately on add/clear/transport since rAF can stall in occluded or nested
  iframes.
- **Vanilla-TypeScript twin** (`examples/vanilla/stress-test.ts`) registered in
  the gallery under a new "Performance" section with live mount, `?raw` TS ↔
  React source toggle, and matching controls; transport fans out to every
  playback via a `TransportablePlayback` group view (play/pause/reverse/seek/
  cancel), demonstrating the harness's structural playback contract.
- **Docs cross-links**: new "Scaling many playbacks" section in
  `docs/playback-lifecycle.md` with a live story embed paired to its "Open in
  Storybook" and "▶ Vanilla TypeScript implementation" links; registration
  convention for the Performance section documented in
  `docs/contributing-docs.md`.
- **Playwright verification**: both surfaces render with zero console errors;
  live adds grow the field (150 → 250 → 750 → 1,750 playbacks) while existing
  animations keep running — FPS held at 60 through ~750 elements and degraded
  gracefully beyond that (DOM compositing cost, not scheduling); pause fans out
  to all playbacks; the docs embed loads and animates locally under the
  `/keyframe-flow/` prefix. `make test` green (274 unit + 22 browser tests).

### Milestone 15 — Timeline Documentation, Stories & Vanilla Twins (T70–T73)

- **New guide: "Timeline & Choreography"** (`docs/timeline-choreography.md`,
  Guides order 6): the definition/execution boundary table from §3.7 and
  Appendix B.1; authoring forms with snippets that match the embedded stories
  (`from`, `sequence` + gap, `parallel`, `stagger`, `repeat`); duration rules
  including `D × N + R × (N − 1)` and how infinite children are handled (§14.3);
  deterministic sampling with unstarted/completed/nested-flatten/schedule-order
  guarantees (§14.4); and Timeline Playback on the shared scheduler with §12
  transport parity and cross-definition supersede (§16.1, §14). Four live story
  embeds, each paired with an "Open in Storybook" manager link and a "▶ Vanilla
  TypeScript implementation" gallery link; cross-linked from the animation
  authoring and playback lifecycle guides (React Integration moved to order 7).
- **Storybook "Timeline" section** (`examples/stories/timeline/`): `Sequence /
  Entrance` (three rows back-to-back with a gap control), `Parallel /
  EndlessScene` (infinite repeating ring plus finite children — duration
  `Infinity`, run never completes), `Stagger / CardFan` (five cards, interval +
  forward/reverse order controls), and `Repeat / AlternatePulse` +
  `RepeatedChoreography` (ping-pong without snapping; a repeated whole sequence
  holding terminal values across delay gaps). Story-side `useTimelinePlayback`
  helper (`examples/stories/timeline-story.tsx`) mirrors the library hook's
  attach/re-attach/dispose and frame-mirrored readout semantics — example
  plumbing stays out of the library; shared `Transport`/`Readout` chrome is now
  structurally typed so it drives animation and timeline handles alike.
- **Vanilla-TypeScript twins** (`examples/vanilla/timeline-{sequence,parallel,
  stagger,repeat}.ts`, React-free) registered as a new **Timeline** gallery
  section with five routes mirroring the story ids, live mounts, story-default
  args and TS ↔ React source tabs; `mountTransport` in the shared harness now
  takes a structural playback contract so it drives both `Playback` and
  `TimelinePlayback`.
- **QA**: all five stories verified in a built Storybook via Playwright — each
  animates with zero console errors/warnings; guide embeds resolve to the local
  `/keyframe-flow/storybook/` build; every gallery route mounts its live demo
  with both source tabs. `docs/contributing-docs.md` records the section/twin
  conventions. Docs build stays warning-free; `make test` green (274 unit +
  22 browser).

### Milestone 14 — Timeline API (T63–T69)

- **`Timeline`: an immutable temporal composition definition** (§3.7, §14.1,
  Appendix A.1/B.1) implementing the vision.md addendum: schedules multiple
  `Animation`/`Timeline` definitions over one shared time axis without changing
  what `Animation`, `Playback`, `Scheduler`, or `RenderTarget` mean. Pure data
  — platform-independent, DOM-free, deterministic, and sampleable with no
  scheduler (§14.4).
- **Composition forms** (§14.1): `Timeline.from({ name: { animation, target?, at } })`
  for absolute placement (bare definitions accepted as shorthand),
  `Timeline.sequence(children, { gap? })` placing children back to back by their
  intrinsic durations, `Timeline.parallel(children)` with independent child
  durations, and nested timelines as first-class children. Placement never
  re-times children; an infinite non-final sequence child is rejected explicitly
  (later siblings would be unreachable, §14.3), while an infinite final or
  parallel child makes the composition's duration infinite.
- **Repetition semantics** (§13.1, §14.2): one consistent options shape —
  `iterations` counts total iterations including the first (positive integers;
  `"infinite"`/`Infinity` explicit and non-completing), `direction` supports
  normal/alternate (+ reverse modes for parity with playback), and `delay` is a
  gap between iterations that never delays the first. `Timeline.repeat(child, …)`
  wraps a child in a compact single-entry repeat operation — never eagerly
  expanded — so large finite counts and infinite loops stay cheap, and outer ×
  child repeats compose independently. Alternate ping-pongs progress without
  snapping to the start between alternating iterations.
- **Stagger** (§14.1): `Timeline.stagger(child, items, { delay, order })` —
  count or render-target array — compiles to ordinary scheduled entries at
  `i × delay` with explicit forward/reverse ordering; no special runtime node.
- **Deterministic sampling & duration** (§14.3, §14.4): finite timelines expose
  `duration = max(at + D×N + R×(N−1))`; `timeline.sample(timeMs)` evaluates every
  started child at `childLocalTime = timeMs − childStart` — unstarted children
  produce nothing, completed children hold endpoint behavior, repeat-delay gaps
  hold terminal values, nested timelines flatten into `{ name?, target?,
  localTime, transform }` samples (unbound inner outputs inherit the wrapping
  entry's target); same-target children resolve by explicit schedule-order
  replacement, never additive composition. Repeating/reversing an
  infinite-duration child is rejected at construction (§14.3).
- **Timeline Playback via the shared scheduler** (§16.1): `timeline.attach()`
  creates a `TimelinePlayback` with full §12 transport parity (play/pause/
  reverse/seek/seekProgress/playbackRate/cancel/dispose + per-run `finished`)
  registered as one scheduled unit on the centralized `PlaybackEngine` —
  children derive local time from the shared timeline clock and never create
  their own clocks. A new internal target-ownership registry lets §14
  replacement semantics hold across definition types: starting a timeline
  supersedes animation playbacks on bound targets and vice versa; disposal
  releases bindings but never destroys adapter-owned render objects (B.8).
- **QA**: 26 new unit tests across placement/duration/repeat mapping/stagger/
  sampling edges/playback lifecycle incl. supersede; full JSDoc with examples —
  docs build passes `strict: true` with zero warnings; exported from
  `keyframe-flow`; all 274 unit + 22 browser tests green.

### Milestone 13 — Pinned Vanilla Examples Link in Docs & Landing Page (T62)

- The vanilla-TypeScript examples gallery (`/keyframe-flow/examples/`) is now a
  pinned header **menu item on every documentation page** ("Vanilla TS",
  TypeScript icon) — the same `cleanJsdocTheme.menu` mechanism that pins
  Storybook — and gained a third card on the site landing page beside
  Documentation and Storybook, described as the framework-free examples gallery.

### Milestone 12 — LLM-Readable Documentation (T61)

- Published the docs for AI tools via clean-jsdoc-theme's built-in
  **llms.txt** support (`llmsTxt: true` in `typedoc.json`): every docs build
  now emits `/keyframe-flow/docs/llms.txt` — an [llms.txt](https://llmstxt.org)
  index with one section per sidebar group, each entry linking the page's
  companion Markdown with its description (76 pages: all guides + API
  references, absolute published-host URLs; source-viewer pages excluded) —
  and `/keyframe-flow/docs/llms-full.txt`, every page body concatenated. Both
  are generated from the same sources as the site, so they never drift, and
  new pages join them automatically via their companion `.md`.
- Linked them where people will look: a header **menu item** (bot icon) on
  every docs page, a README documentation bullet, and a new reader-facing
  **"AI & LLM tools"** section in Getting Started explaining the convention —
  hand the index URL to any model for on-demand fetches, or the full file when
  context budget allows; plus notes that every page ships its `index.md`
  companion and copy / open-in-LLM actions. `docs/contributing-docs.md` gained
  a maintainer section on how the indexes are produced.

### Milestone 11 — Documentation-Local Links, Guide-Aligned Examples & Gallery Polish (T58–T60)

- **Local previews now stay local.** `docs/embed-host-rewrite.js` rewrites not
  only Storybook iframe embeds but also the "Open in Storybook" and
  "▶ Vanilla TypeScript implementation" anchor links to same-origin paths when
  served from any host other than the published GitHub Pages origin. Fixed
  `make preview-site`'s server: `serve` 301-redirects `*.html` requests and
  drops query strings — which blanked every Storybook embed ("No Preview") —
  so the target now uses Python's stdlib server (GitHub Pages keeps query
  strings; published embeds unaffected).
- **Storybook examples now mirror the documentation.** New **Guides** story
  section runs guide snippets verbatim: `guides-getting-started--first-animation`
  (the three-object-model `slide`), `guides-getting-started--sample-without-playing`
  (the same definition sampled by a host rAF loop), and
  `guides-core-concepts--crane-vs-orbit` (composition order: same operations,
  opposite order, endpoints (100,0) vs (0,100)). Existing embedded stories were
  realigned with their guide snippets — from/to now is the guide's `fadeUp`,
  keyframes the `bounce` path, combine the exact move/spin/pulse values, orbit
  the radius-80 generator at 4000 ms, and SLERP-vs-angular the 1000 ms full
  revolution. The two unrelated getting-started embeds and core-concepts embed
  were replaced; every story gained a substantive Docs description explaining
  what it demonstrates and linking its guide section. Vanilla twins and gallery
  entries follow all new/renamed ids (21 examples total). `Matrix4.el(index)`
  became public so the guides' documented `m.el(12)` column-major reads compile
  verbatim.
- **Examples gallery polish.** `/keyframe-flow/examples/` gained a header
  light/dark toggle (persisted to localStorage, following
  `prefers-color-scheme`, applied pre-paint via CSS custom properties) and full
  Prism syntax highlighting of the TypeScript and TSX code panels with theme
  token palettes for both modes.

### Milestone 10 — React Helpers, Vanilla Examples Gallery & Link Fixes (T51–T57)

- Added a **`keyframe-flow/react` subpath** with dedicated React component
  helpers: `useKeyframePlayback(animation, options)` (host ref, frame-mirrored
  state readout with control-kick resync, full transport including the
  forward-facing `reset()`) and `<Animated>`, a declarative host-div wrapper
  defaulting to `target.html`. React is an external peer dependency of that
  entry only; the core build still never sees DOM or React types (core
  tsconfig excludes `src/react`; a new `tsconfig.react.json` + `make
  typecheck-react` cover it), and browser tests exercise attach/re-attach/
  dispose lifecycle. All 18 stories now run on the library hook — story-side
  code keeps only transport/readout chrome. Documented in the new
  **`docs/react-integration.md`** guide.
- Shipped a **standalone vanilla-TypeScript examples gallery** at
  `/keyframe-flow/examples/`: every Storybook example has a pure-TS twin under
  `examples/vanilla/` (imports only `keyframe-flow` + DOM APIs, driven by a
  shared imperative transport/readout harness), presented by a small Vite app
  (`examples/gallery/`, built via `make build-gallery`) with a landing page per
  section and hash-routed pages pairing the live demo with its source —
  toggleable between the TypeScript implementation and the React twin. Docs
  embeds link down to their gallery page. Storybook stays React-only: it binds
  one UI renderer per build, so plain-DOM stories can't share a build with
  React ones.
- Fixed **"Open in Storybook" deep links** (19 across the guides): the manager
  ignores bare `?id=<story-id>`; all links now use the canonical
  `?path=/story/<story-id>` route form, Playwright-verified to land on the
  exact linked story. Guide gallery/deep links use absolute published-host URLs
  because relative and root-relative forms break under theme link rewriting or
  servers that omit trailing slashes.
- Fixed unclosed markdown links in `README.md` (vision/concepts bullet + docs
  table rows) and `docs/core-concepts.md` API-reference bullets.
- Added **`make preview-site`**: serves the built `site/` (docs + Storybook +
  gallery) at `http://localhost:4173/keyframe-flow/` via `pnpm dlx serve`
  (Python fallback), using a `.preview/` symlink so the site's absolute base
  paths resolve.

### Milestone 9 — Interactive Documentation Examples (T50)

- Embedded **playable Storybook demos directly in the docs guides**: 19 live
  embeds across all six guides (getting-started, core-concepts,
  animation-authoring, easing-interpolation, playback-lifecycle,
  render-adapters), built with clean-jsdoc-theme v5's `iframe` fence — each
  points at the bare story canvas (`storybook/iframe.html?id=<story-id>`) so it
  carries its own transport (play/pause/reset/reverse/cancel), and each is
  paired with an "Open in Storybook" link to the full story with arg controls.
  The pattern, URL conventions, and local-preview recipe are documented in
  `docs/contributing-docs.md`.
- Added `docs/embed-host-rewrite.js`, injected into every generated docs page
  by `make build-docs`: embed URLs are protocol-relative and pinned to the
  published GitHub Pages host (the theme only accepts `https://` or `//` URLs),
  so the shim — a no-op on Pages itself — rewrites them to same-origin for any
  other origin, letting a locally served copy of `site/` preview embeds against
  the local Storybook build.
- Fixed a second embedded-context engine defect found during verification: in
  nested iframes, rAF callback timestamps can stall relative to the realm's
  `performance.now()`, and `PlaybackEngine._requestFrame` stepped playbacks by
  the scheduler callback argument while `play()` anchors from `clock.now()` —
  so the non-forward guard skipped every update and runs froze at `t = 0`. The
  engine now dispatches `clock.now()` to playbacks and ignores the callback
  argument, honoring Appendix B.7 ("scheduling is not timekeeping"); the guard
  in `onEngineUpdate` remains as defense against non-monotonic custom clocks.
  One unit regression test added (engine steps from its Clock, not frame
  timestamps), bringing the Node suite to 248.

### Milestone 8 — Storybook Reset Control & GPU Example Fixes (T48–T49)

- Added a **reset** control to the shared Storybook transport so every example
  can rewind and replay from the beginning facing forward. `useKeyframePlayback`
  now exposes `reset()`, which seeks playback to progress 0 and — because §12
  restarts a run in its _current_ direction — flips the instance back to
  forward if it was reversed, so a subsequent `play()` always runs 0 → 1 rather
  than backwards. The button is wired into the shared `Transport`, so all 14
  stories using it gain reset for free.
- Fixed the **WebGL and WebGPU target stories** rendering nothing: both call
  `useKeyframePlayback` but never attached its `hostRef` to any element, so the
  hook's effect early-returned on a null host — no playback instance was ever
  created, every transport button silently did nothing, and the uniform
  upload/write readouts stayed empty. Both now attach `hostRef` to their layout
  wrapper (the custom-target pattern: host for layout only, GPU adapter ignores
  it). Verified via Playwright that both autoplay and drive real GPU paths — a
  moving WebGL quad through `uniformMatrix4fv`, live WebGPU translation values —
  with zero console errors.
- Fixed a latent engine defect the GPU investigation surfaced: button-restarted
  runs could finish instantly. A frame callback can deliver a timestamp older
  than the anchor captured in `play()` (input dispatched inside an already
  started frame), and because a run always begins exactly on a timeline boundary
  (`t = 0` forward, `t = duration` reversed), even a few milliseconds of negative
  delta crossed the opposite boundary and completed the run in one step.
  `Playback.onEngineUpdate` now ignores non-forward timestamps (§16) without
  double-counting the skipped interval. Added two unit regression tests
  (boundary restart with a stale timestamp; mid-run out-of-order frame), bringing
  the Node suite to 247.
- Made the story readout re-sync whenever a transport control is pressed: the
  frame-mirror loop stops as soon as playback is not running, so discrete
  actions (play after finish, reset, seek) would otherwise show stale state. All
  controls now share one rAF handle and kick it on every action.
- Verified end to end with Playwright against the rebuilt static Storybook: all
  18 stories render, every transport-bearing story shows the reset button, and a
  full reverse → reset → play round trip advances `t` from 0 to duration forward
  on both GPU targets; unit (247), browser (20), examples `tsc`, lint, format,
  and type checks all green.

### Milestone 7 — Storybook Runtime Fixes (T46)

- Fixed a browser-only defect where every animated Storybook story failed with
  `TypeError: Illegal invocation`: `resolveFrameHost` captured
  `globalThis.requestAnimationFrame`/`cancelAnimationFrame` as unbound
  references and later invoked them as methods of the plain `{ request, cancel }`
  frame-host object, so Chromium rejected the wrong `this`. The frame
  functions are now wrapped so rAF/cAF always run with the global object as
  receiver; resolution still happens at call time, keeping §2 principle 1
  intact.
- Added `src/timing/scheduler.browser.test.ts` — three Chromium regression
  tests covering the default browser frame path: requesting a real
  `requestAnimationFrame` tick, cancelling a requested frame, and driving
  full playback through the lazily created shared engine with no injected
  clock or scheduler. Previously `createFrameScheduler` was only tested via
  Node's timer fallback, which is why the defect survived an otherwise green
  suite (browser tests now 20 total).
- Verified in a real browser via Playwright: rebuilt Storybook serves all 18
  stories with zero console errors (previously every playback story rendered
  "Illegal invocation — The component failed"); unit (245), browser (20),
  lint, format, and type checks all green.
- Enabled the Storybook Code panel so every published example shows its
  source (T47): `parameters.docs.codePanel: true` in
  `examples/.storybook/preview.tsx`, plus the required
  `@storybook/addon-docs` dev dependency registered in `.storybook/main.ts`
  (the panel is a docs-addon contribution and stays hidden without it). The
  addon's auto-generated `<Component {...args}/>` snippet renders as `<l …/>`
  in minified builds, so a small `enforce: "pre"` Vite plugin appends each
  story module's verbatim TSX source into `meta.parameters.docs.source.code`
  (the panel's highest-precedence source key), giving readers the real
  example code — imports, animation definitions and all. Playwright-verified:
  the Code tab opens for all 18 stories with authored source and zero console
  errors.

### Milestone 6 — User Documentation (T38–T45)

- Authored seven user-facing guides in `docs/` with frontmatter
  `title`/`group`/`order` for sidebar grouping: getting started, core concepts
  & coordinate conventions (§4.4), animation authoring styles (§5), easing &
  interpolation (§8, §9), playback & lifecycle (§11–§13), render adapters &
  custom targets (§17), and `contributing-docs.md` documenting the docs
  pipeline itself; `README.md` serves as the library landing page and links
  `design-docs/vision.md` as the internal source of truth rather than
  duplicating it.
- Set up the API reference with TypeDoc + clean-jsdoc-theme v5
  (`@clean-jsdoc-theme/typedoc`) via root `typedoc.json`: entry point
  `src/index.ts`, output `site/docs`, theme block with `siteName`, `basePath`
  `/keyframe-flow/docs` (GitHub Pages project-site hosting), `siteUrl`
  (enables sitemap.xml), `docs: "docs"` + `docGroups` for prose sidebar
  ordering, `menu` links to the storybook, and `strict: true` — the build
  passes with zero warnings. Inline type-literal members cannot carry JSDoc,
  so undocumented public shapes were extracted into named exported interfaces
  (`Vector3Object`, `QuaternionObject`, `DOMPointInput`, `DOMPointOutput`,
  `PlaybackFinishedResult`, `PlaybackCancelledResult`).
- Documented every remaining public export (all 113 previously-undocumented
  symbols, including the `Matrix4` `m11`–`m44` DOMMatrix members) with
  descriptions, `@param`/`@returns`, runnable `@example` blocks, and `{@link}`
  cross-references. JSDoc summaries were rewritten to be link-free because the
  theme renders summaries as plain text in `<meta>` descriptions and
  pagination cards — body content with links now lives under `@remarks`.
- Set up a real Storybook (React renderer, Vite builder via
  `@storybook/react-vite`) in `examples/.storybook` with stories in
  `examples/stories/**/*.stories.tsx`; each story mounts a live keyframe-flow
  animation into a React host and exposes duration/easing/transport controls.
  The library resolves through an absolute `keyframe-flow` → `src/index.ts`
  alias so stories always exercise the working tree. Eighteen stories cover
  from/to & property-level definitions (§5.2, §7), static keyframes +
  generator sources (§5.3–§5.5), all 26 named easings plus custom curves (§8),
  SLERP shortest-path vs. angular full-revolution tracks (§9), manual-sampling
  into an external render loop (§10.3), playback controls, repetition, and
  target-supersede lifecycle (§11–§13), and HTML/SVG/Canvas/WebGL/WebGPU
  adapters plus a structural custom target (§17). Stories are type-checked by
  `examples/tsconfig.json` (`make typecheck-examples`).
- Unified GitHub Pages hosting as one site staged in `site/`: API reference +
  guides under `site/docs/`, storybook under `site/storybook/`, and a
  self-contained dark/light landing page (authored as `docs/site-index.html`)
  linking both. `site/.nojekyll` is required because the theme's
  `_assets/`-prefixed files would otherwise be stripped by Jekyll; the
  Makefile's `github_pages_deploy` target passes `gh-pages --dotfiles` so it
  publishes. Storybook 10 emits subpath-portable relative asset URLs, so no
  base-path flag is needed (and none exists).
- Verified the full docs pipeline end to end without pushing: `make
  build-docs` (zero warnings), `make build-storybook` (18 stories), local
  preview of `site/` under a `/keyframe-flow/` prefix returning 200 for all
  surfaces and assets, an automated link audit (7.7k root-absolute + 22
  relative hrefs, 742 in-page anchors — zero broken), no raw `{@link}` text
  leaking into rendered pages, and mobile viewport + dark-mode sanity across
  landing, docs, and storybook.

### Milestone 5 — Advanced Capabilities (T32–T37, §9, §14)

- Implemented `target.webgl(options)` and `target.webgpu(options)` adapters
  (§3.6): each owns only rendering state — the latest evaluated transform as a
  column-major `Float32Array` in the exact layout `gl.uniformMatrix4fv`/GLSL
  `mat4` and WGSL `mat4x4<f32>` consume (§15) — plus an optional `onTransform`
  upload hook. No GPU resources are created, playback time and lifecycle are
  never touched, disposal destroys nothing (Appendix B.8), and hosts can poll
  `matrixValues` or copy into existing buffers via `copyMatrixValuesTo`
  without allocation (§2.9). Verified against a real WebGL context in the
  Chromium browser suite (uniform round-trip through `gl.getUniform`).
- Implemented property-level composition via animated-property tracks
  (§14): `animatedProperties` detects which of position/rotation/scale an
  animation actually changes (including wobble that returns to its start
  value), and `Animation.combine([move, rotate, scale])` merges inputs per
  property — each input overrides only the properties it animates, later
  inputs win overlaps with no additive composition, and shorter inputs hold
  their final value once complete. Composition required zero engine changes.
- Implemented angular rotation tracks (§9.1): `rotationMode: "angular"`
  interpolates authored Euler angles in radians component-wise so a segment
  from `0` to `2π` performs one full revolution without intermediate
  keyframes — the case shortest-path quaternion SLERP collapses to a no-op,
  which is tested explicitly. Authored `[x, y, z]` rotations are captured
  verbatim during eager normalization; quaternion-only inputs decompose via
  the new `Quaternion#toEuler` (inverse of `fromEuler`'s intrinsic X→Y→Z
  convention, with a documented gimbal-lock resolution), round-trip-verified
  over a deterministic 250-sample orientation sweep.
- Implemented animation groups and nested timelines (§14, §19):
  `Animation.group(children)` sequences children back to back over the summed
  duration; `{ layout: "parallel" }` runs them simultaneously with
  combine-style property merging. Groups are ordinary `Animation` values, so
  nesting composes naturally (groups of groups tested).
- Added explicit advanced raw-matrix interpolation (§9.2):
  `interpolation: "raw-matrix"` samples through element-wise `Matrix4#lerp`
  of endpoint matrices; results that are not TRS-decomposable (interpolated
  rotations gain shear) throw explicitly rather than being approximated, and
  conflicting option combinations (`angular` + `raw-matrix`) throw at
  definition time.

### Milestone 4 — Render Adapters (T27–T31, §17)

- Defined the structural `RenderTarget { setTransform(matrix); dispose?() }`
  interface (§17.1): custom rendering systems need no library base class or
  imports; adapters own rendering state only and never playback time or
  lifecycle (§3.6, §17.2). `Playback.dispose()` invokes the adapter's optional
  cleanup hook but never destroys host resources (Appendix B.8).
- Implemented `target.html(element)`: writes CSS `matrix3d()` values in
  column-major argument order (no transposition), replaces any pre-existing
  inline transform since the adapter owns that property, and supports an
  optional one-time `transformOrigin` (§17, §17.3).
- Implemented `target.svg(element)`: writes SVG 1.1 `matrix(a, b, c, d, e, f)`
  transform attributes mapped from column vectors; documents that SVG 1.1 is
  inherently 2D affine so Z/perspective members are not expressible (§17).
- Implemented `target.canvas(context)`: projects the evaluated 4×4 matrix
  through an explicit `projectToCanvas2D` step (homogeneous images of the
  origin and X/Y axes, perspective division, optional camera distance) rather
  than forwarding a raw matrix Canvas cannot apply; `setTransform` owns the
  context CTM deterministically (§17.3). Pure affine inputs reduce exactly to
  their affine part.
- Added adapter behavior tests: unit tests for the pure conversion/projection
  math, and Chromium browser tests verifying real DOM/canvas interop (browser
  CSS parser agreement via native `DOMMatrix`, context CTM checks), custom
  structural targets working with zero engine changes, supersede/dispose
  ownership, and that disposing playback leaves elements, contexts, and custom
  objects fully intact (§17.2, §21).

### Milestone 3 — Playback Engine (T18–T26, §11–§14, §16)

- Added injectable time sources (§16): `Clock { now() }` and
  `Scheduler { request(cb); cancel(handle) }` as separate interfaces — the
  clock provides time while the scheduler coordinates updates (Appendix B.7).
  `systemClock` uses `performance.now()`/`Date.now()`; `createFrameScheduler()`
  resolves `requestAnimationFrame` in browsers and a timer fallback elsewhere
  at first use, so importing the library never touches browser APIs.
  `ManualClock` and `ManualScheduler` provide fully deterministic
  test/Node-friendly alternatives.
- Implemented the centralized `PlaybackEngine`: drives all active playbacks
  from one shared frame request, advances time from clock timestamps (never
  frame counts), scales elapsed deltas by `playbackRate` so rate changes never
  jump time, and requests no further frames when nothing is active (§16). A
  lazily created default engine backs playbacks that do not inject their own.
- Implemented `animation.attach(target?)` creating independent `Playback`
  instances with their own execution state and lifecycle while sharing the
  definition's immutable timeline; attachment without a target supports pure
  time control (§11). Options: `iterations`, `direction`, `playbackRate`,
  `autoplay`, and custom `engine`.
- Implemented the full §11.1/§12 playback surface: `state`, `currentTime`
  (elapsed ms within the current iteration), per-run `finished` promise,
  settable `playbackRate`, `play`/`pause`/`reverse`/`seek`/`seekProgress`/
  `cancel`/`dispose`. Play on a finished instance restarts from the beginning
  in the current direction; pausing retains time; seeking clamps and renders
  immediately.
- Implemented completion behavior (§11.1, §12): `finished` resolves
  `{ status: "finished" | "cancelled" }` per run and never rejects on ordinary
  cancel; `cancel()` retains the last rendered transform (no original-state
  capture); `dispose()` is idempotent, settles pending promises, and all other
  operations on disposed instances throw.
- Implemented repetition and direction in the engine (§13): single, finite
  counts including the initial iteration, infinite runs that never naturally
  complete, reverse, and alternate/alternate-reverse playback across many
  boundary crossings per frame — keyframes are never duplicated.
- Implemented target replacement semantics (§14): one active playback owns a
  render target via a structural `RenderTarget { setTransform(matrix);
  dispose?() }` interface (T27 groundwork, §17.1); starting another playback
  on the same target supersedes (cancels) the existing owner with no implicit
  additive composition; disposal never destroys the underlying target
  (Appendix B.8).
- Added 31 unit tests (200 total) covering clock/scheduler contracts, frame
  request economy, every §12 state and transition, restart-in-direction, rate
  continuity, zero-duration runs, finite/infinite/alternate repetition,
  supersede of running and paused owners, per-run promises, disposal
  idempotence and throw-after-dispose, and determinism of identical tick
  streams.

### Milestone 2 — Animation Definitions (T10–T17, §5–§10)

- Added the animation subsystem (`src/animation/`) with keyframe types
  `Keyframe<T>` and `TransformKeyframe { at, transform, easing? }`, where
  `at` is normalized progress in `[0, 1]`, independent of millisecond
  duration (§6.1, §6.2).
- Implemented `Animation.from()` as the single construction entry point
  (§5.1), accepting from/to definitions (§5.2), static keyframe arrays
  (§5.3), and generator-produced keyframes (§5.4). Definitions are
  immutable and reusable; generators are authoring mechanisms, not playback
  mechanisms (Appendix B.2).
- Implemented eager keyframe normalization: arrays, synchronous iterables,
  generator instances, and functions returning iterables are consumed
  exactly once when the definition is created (§5.5); the resulting frozen
  timeline is shared by every consumer, named easings are resolved eagerly,
  async iterables/generators are rejected explicitly, and sampling never
  re-executes a source.
- Implemented keyframe validation (§6.3): timestamps must be finite numbers
  in `[0, 1]`, strictly increasing, with no duplicates; empty timelines
  throw; a single keyframe yields a constant animation; missing endpoints
  hold the first/last value; out-of-order or duplicate timestamps throw —
  keyframes are never silently reordered.
- Implemented from/to definitions normalized into the same two-keyframe
  timeline at `at = 0` and `at = 1`, with millisecond durations validated
  to be finite and non-negative (§5.2, §6.2).
- Implemented property-level definitions (§7): partial
  `{ position, rotation, scale }` objects (Euler radians or quaternions,
  uniform-scale shorthand) merge into the canonical transform
  representation; unspecified properties are preserved from the explicit
  starting transform, falling back to documented identity defaults.
- Implemented easing (§8): 26 built-in named easings covering linear plus
  CSS `ease`/`ease-in`/`ease-out`/`ease-in-out` (via a Newton-Raphson +
  bisection cubic-bezier solver) and the sine/quad/cubic/quart/quint/expo/
  circ in/out/in-out families; custom `(progress) => number` functions need
  no registration; animation-level easing provides the default while
  per-keyframe easing controls interpolation to the next keyframe; unknown
  names throw eagerly at definition time.
- Implemented property-aware interpolation (§9): translation and scale
  interpolate linearly, 3D rotation uses quaternion SLERP with input
  normalization and shortest-path default (§9.1), pure-Z (2D) rotations use
  direct angular interpolation with shortest-path wrapping; raw element-
  wise matrix interpolation is never the default and midpoints of two
  transforms always decompose cleanly to TRS.
- Implemented manual sampling as a first-class feature (§10):
  `animation.sample(ms)` and `animation.sampleProgress(p)` evaluate the
  same timeline (500 ms of a 2000 ms animation equals 0.25 progress),
  out-of-range inputs clamp to the boundaries, exact keyframe hits return
  the authored transforms, non-finite inputs throw, and sampling requires
  no scheduler or render target and never mutates the definition (§10.3).
- Added 107 unit tests (Node; 169 total) covering eager generator
  execution, shared frozen timelines, every §6.3 validation rule, property-
  level merge semantics, easing curve endpoints/monotonicity/CSS-curve
  values, segment-easing precedence, SLERP shortest-path and 2D angular
  equivalence, non-default matrix behavior, and sampling equivalence,
  clamping, endpoint holds, and determinism.

### Milestone 1 — Transform and Matrix Foundations (T1–T9, §4, §9, §15)

- Set up Vite+ (`vp`) tooling: library build config in `vite.config.ts`,
  Node-environment Vitest unit config, a Chromium browser suite via
  `vitest.browser.config.ts` (Playwright provider), a `vp dev` playground,
  and a `.gitignore`. All Makefile targets (`typecheck`, `lint`, `test-unit`,
  `test-browser`) pass.
- Added immutable `Vector3` primitives: `add`, `subtract`, `scale`, `dot`,
  right-handed `cross`, `length`, `normalize` (throws on zero length).
- Added `Quaternion` primitives: `fromAxisAngle`, `fromEuler` (intrinsic
  X→Y→Z, radians), Hamilton `multiply`, `normalize`, `conjugate`, `dot`,
  `rotateVector`, and `slerp` with shortest-path default (§9.1). Rotations are
  stored internally as quaternions (§4.3).
- Added canonical portable `Matrix4`: right-handed coordinates, column
  vectors, column-major storage, radians (§4.4); creation from values/arrays;
  `toFloat32Array`/`fromFloat32Array`; conversions to/from `DOMMatrix` that go
  through named members under CSSOM's `m<column><row>` naming so mathematical
  meaning survives regardless of storage convention (§15.2). The core runs in
  plain Node with no browser APIs; `toDOMMatrix()` throws a helpful error when
  the API is unavailable.
- Implemented matrix operations: strict `a.multiply(b)` = A × B on column
  vectors, cofactor `invert` (throws on singular matrices), `fromTRS`
  composition (T × R × S), and `decompose` back to TRS that throws explicitly
  for shear, reflection, perspective, and singular matrices (§9.2, §15.1).
- Added immutable `Transform` with frozen canonical components
  `{ position, rotation: Quaternion, scale }`; Euler angles are accepted only
  as a radians construction interface, and negative scale is rejected
  explicitly (§4.2, §4.3).
- Implemented fluent (`transform().translate(…).rotateY(…).scale(…)`) and
  declarative (`transform({ position, rotation, scale })`) construction; every
  operation returns a new transform without mutating the source (§4.1, §4.2).
- Implemented composition semantics: fluent operations apply in call order as
  local-space operations (`M ← M × Op`), parent-to-child composition is
  `Parent × Local`, and `worldTranslate`/`worldRotate*` act in the parent
  coordinate system (§4.4). Non-uniform scale followed by rotation genuinely
  produces shear, so it throws rather than approximating.
- Added 62 unit tests (Node) covering right-handedness, radians, column-major
  layout, multiplication order, inversion round-trips, TRS compose/decompose
  round-trips, explicit throws for unsupported matrices, immutability, fluent
  call-order semantics, and parent/child composition; plus 7 browser tests
  verifying interop with the real `DOMMatrix` (`transformPoint` agreement,
  native multiplication order, column-major array layout, round-trips).
