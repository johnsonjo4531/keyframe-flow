# TODOS

Tasks derived from `design-docs/vision.md` — Section 20 "Initial Implementation Milestones". Design decisions referenced by section number (e.g. §4, §6) are in the vision design doc, which is the source of truth.

## Milestone 1: Transform and Matrix Foundations

1. [x] Set up project tooling so tests run: `vp` dev/build config, Vitest unit config, and a browser test config (`vitest.browser.config.ts`) matching the Makefile targets. Core must run without browser APIs (§2 principle 1).
2. [x] Implement `Vector3` primitives (add, scale, dot, cross, length, normalize) with immutable public values.
3. [x] Implement `Quaternion` primitives (from Euler radians, multiply, normalize, conjugate, slerp-ready building blocks). Rotations are stored internally as quaternions (§4.3).
4. [x] Implement portable canonical `Matrix4`: column-major storage, right-handed coordinates, column vectors, radians (§4.4); creation from values/arrays and conversions to/from `DOMMatrix` and `Float32Array` preserving mathematical meaning, not raw element copying (§15, §15.2).
5. [x] Implement matrix operations: multiplication (`a.multiply(b)` = A × B), inversion, composition of TRS components into a matrix, and decomposition back to TRS where mathematically supported — unsupported matrices (shear, reflection, perspective, singular) must throw explicitly (§9.2, §15.1).
6. [x] Implement immutable `Transform` with canonical `{ position, rotation: Quaternion, scale }` representation; Euler angles accepted only as a radians construction interface (§4.2, §4.3).
7. [x] Implement transform construction: fluent `transform().translate(x,y,z).rotateY(rad).scale(s)` and declarative `transform({ position, rotation, scale })`; every operation returns a new transform without mutating the source (§4.1, §4.2).
8. [x] Implement transform composition: fluent operations applied in call order as local-space operations; parent-to-child composition via `Parent × Local`; world-space operations act in the parent coordinate system (§4.4).
9. [x] Write coordinate-convention tests: right-handedness, column-major storage layout, multiplication order, radians, translation placement, and DOMMatrix/Float32Array round-trips (§4.4, §15.2).

## Milestone 2: Animation Definitions

10. [x] Define keyframe types: `Keyframe<T> { at, value }` and `TransformKeyframe { at, transform, easing? }` with normalized `at` in `[0, 1]` (§6.1).
11. [x] Implement `Animation.from()` with eager keyframe normalization: support arrays, synchronous iterables, generator instances, and functions returning iterables; generators run exactly once per definition, and playback instances share the normalized timeline (§5.4, §5.5).
12. [x] Implement keyframe validation: finite numbers in `[0, 1]`, strictly increasing, no duplicates; empty throws, single keyframe yields constant animation, missing endpoints hold first/last value, out-of-order/duplicate/invalid timestamps throw, keyframes never silently reordered (§6.3).
13. [x] Implement from/to definitions (`from`, `to`, `duration` in ms, optional `easing`) normalized into the same underlying timeline (§5.2, §6.2).
14. [x] Implement property-level from/to definitions (partial `{ position, rotation, ... }`) normalized into transform representation; unspecified properties preserved from explicit starting transform or documented identity defaults (§7).
15. [x] Implement easing: built-in named linear/ease-in/ease-out/ease-in-out variants, custom `(progress) => number` functions without global registration, animation-level default plus per-keyframe segment easing controlling interpolation to the next keyframe (§8).
16. [x] Implement property-aware interpolation: linear for translation and scale, quaternion SLERP with normalization and shortest-path default for 3D rotation, angular interpolation for 2D rotation; raw element-wise matrix interpolation is not the default (§9, §9.1).
17. [x] Implement manual sampling: `animation.sample(ms)` and `animation.sampleProgress(0..1)` evaluating the same timeline, equivalent results (e.g. 500ms of 2000ms == 0.25 progress), out-of-range inputs clamped, no scheduler or render target required (§10).

## Milestone 3: Playback Engine

18. [x] Define injectable `Clock { now() }` and `Scheduler { request(cb); cancel(handle) }` interfaces with a browser `requestAnimationFrame` default plus test/Node-friendly alternatives (§16).
19. [x] Implement the centralized scheduler: drives all active playbacks, timestamp-based time progression (never frame-count), rate changes preserve continuity relative to current timestamp, no unnecessary updates when nothing is active (§16).
20. [x] Implement `animation.attach(target?)` creating independent playback instances with their own execution state and lifecycle; attachment without a target must work for pure time control (§11).
21. [x] Implement playback controls per the `Playback` interface: `play`, `pause`, `reverse`, `seek(ms)`, `seekProgress(p)`; play on finished restarts from beginning in current direction; pausing retains time (§11.1, §12).
22. [x] Implement `playbackRate` as a settable property with no time discontinuities on change (§11.1, §12, §16).
23. [x] Implement repetition and direction: single, finite (total count includes the initial iteration), infinite (never naturally completes), reverse, and alternate playback — handled by the engine, not duplicated keyframes (§13).
24. [x] Implement completion behavior: per-run `finished` promise resolving `{ status: "finished" | "cancelled" }` (resolve, never reject, on ordinary cancel); `cancel()` retains last rendered transform; `dispose()` idempotent; operations on disposed instances throw (§11.1, §12).
25. [x] Implement target replacement semantics: one active transform-producing playback owns a target; starting another supersedes the existing one; no implicit additive composition (§14).
26. [x] Write lifecycle tests with fake clock/scheduler covering all states (idle, running, paused, finished, cancelled, disposed), every transition in the §12 table, repetition/direction behavior, and determinism (§12, §13, §21).

## Milestone 4: Render Adapters

27. [x] Define the structural `RenderTarget { setTransform(matrix); dispose?() }` interface — custom targets need no library base class; adapters own rendering state only, never playback time or lifecycle (§17.1, §17.2, §3.6).
28. [x] Implement `target.html(element)` adapter: matrix conversion to CSS `transform`, transform-origin and existing-transform handling (§17, §17.3).
29. [x] Implement `target.svg(element)` adapter for SVG transform attributes (§17).
30. [x] Implement `target.canvas(context)` adapter for Canvas 2D, including the required projection step rather than forwarding a raw 4×4 matrix (§17.3).
31. [x] Write adapter behavior tests: custom structural targets work without modifying the engine, and disposing playback never destroys the underlying element/canvas/context (§17.2, §21).

## Milestone 5: Advanced Capabilities

32. [x] Implement a WebGL render adapter (§3.6, §20 M5).
33. [x] Implement a WebGPU render adapter (§3.6, §20 M5).
34. [x] Implement property-level composition via property tracks so independent animations can affect different properties simultaneously, with `Animation.combine([move, rotate, scale])` as a convenience layer on top (§14).
35. [x] Implement advanced angular rotation tracks enabling full revolutions without intermediate keyframes (§9.1).
36. [x] Implement animation groups and nested timelines (§14, §19).
37. [x] Add explicit advanced raw-matrix interpolation option for non-decomposable transforms (shear/perspective), failing explicitly rather than approximating (§9.2), plus additional matrix/interpolation extensions as needed.

## Milestone 6: User Documentation

Depends on Milestones 3–5: the storybook examples demonstrate playback and render adapters, so they are authored last. All user-facing documentation lives in `docs/`; the API reference and the example storybook deploy side by side under one GitHub Pages site.

38. [x] Create the `docs/` folder with user-facing guides (frontmatter `title`/`group`/`order` for sidebar grouping): getting started, core concepts & coordinate conventions (§4.4), animation authoring styles (§5), easing & interpolation (§8, §9), playback & lifecycle (§11–§13), render adapters & custom targets (§17); add a root `README.md` as the library landing page. Keep `design-docs/` as the internal source of truth — link to it rather than duplicating it.
39. [x] Set up API-reference generation with TypeDoc + clean-jsdoc-theme v5 (`@clean-jsdoc-theme/typedoc`): `typedoc.json` at the repo root with `entryPoints: ["src/index.ts"]`, `plugin: ["@clean-jsdoc-theme/typedoc"]`, `outputs: [{ name: "clean-jsdoc-theme", path: "site/docs" }]`, and theme options in a `cleanJsdocTheme` block — `siteName`, `basePath` (`/keyframe-flow/docs` for GitHub Pages project-site hosting), `siteUrl` (enables sitemap.xml), `docs: "docs"` + `docGroups` to order the prose sidebar (the TypeDoc API sidebar is a fixed module/folder hierarchy — shape navigation with `menu` links to the storybook instead of `@category`/`sectionOrder`, which do not apply there), and `strict: true`.
40. [x] Ensure JSDoc coverage on every public export (`Animation`, `transform`, `Transform`, `matrix`, `Matrix4`, `Vector3`, `Quaternion`, plus the Milestone 3–5 playback/target APIs): descriptions, `@param`/`@returns`, runnable `@example` blocks, and `{@link}` cross-references between related symbols; the TypeDoc build passes with zero warnings under `strict: true`.
41. [x] Set up the storybook of examples with actual Storybook — React renderer, Vite builder (`@storybook/react-vite`): config in `examples/.storybook/`, stories in `examples/stories/**/*.stories.tsx`; each story mounts a live keyframe-flow animation into a React host element and exposes controls (duration, easing, playback state); build to `site/storybook/` with `--base-path /keyframe-flow/storybook/`.
42. [x] Author example coverage: from/to & property-level definitions (§5.2, §7), static keyframes + generator sources (§5.3–§5.5), easing families including custom functions (§8), interpolation behavior — SLERP shortest path, 2D angular, no raw matrix lerp (§9), manual-sampling integration into an external render loop (§10.3), playback controls & lifecycle (§11–§13), and HTML/SVG/Canvas adapters plus one structural custom target (§17).
43. [x] Unify GitHub Pages hosting as a single site: staging directory `site/` with the API reference + guides at `<base>/docs/` and the storybook at `<base>/storybook/` side by side; a landing `index.html` (authored as `docs/site-index.html`) linking both. Verify every base path and asset resolves on Pages — including the theme's `_assets/`/`_islands/` directories, which require `.nojekyll` because Jekyll strips underscore-prefixed files.
44. [x] Wire up the Makefile documentation pipeline: `build-docs` (TypeDoc → `site/docs`), `build-storybook` (`storybook build --config-dir examples/.storybook -o site/storybook --base-path /keyframe-flow/storybook/`), and `github_pages_deploy` (build both, stage the landing page + `.nojekyll`, publish `site/` to the `gh-pages` branch with `npx --yes gh-pages -d site --dotfiles`). The targets are scaffolded in the Makefile now — validate them end-to-end once docs and stories exist.
45. [x] Documentation QA: every `{@link}` resolves (unresolved namepaths silently render as inline code — grep for those), guide ↔ API reference ↔ storybook cross-links correct, no broken images/assets in a local preview (`npx serve site`), mobile + dark-mode sanity pass; document the docs workflow itself in `docs/contributing-docs.md`.

## Milestone 7: Storybook Runtime Fixes

Discovered via Playwright inspection of the built Storybook (`site/storybook`): every story that drives playback renders "Illegal invocation — The component failed" with a `TypeError` thrown from the scheduler's frame-request path in the browser bundle.

46. [x] Fix the Storybook runtime failure where all animated stories throw `TypeError: Illegal invocation`: `resolveFrameHost` in `src/timing/scheduler.ts` captures unbound `globalThis.requestAnimationFrame`/`cancelAnimationFrame` references and later invokes them as methods of a plain `{ request, cancel }` host object, so the browser rejects the wrong `this` (§16). Wrap/bind the frame functions so rAF is always called with the environment as receiver; add a Chromium browser-suite regression test that drives real playback through the default `createFrameScheduler()` path (the suite currently only covers the Node timer fallback in `timing.test.ts`, which is why 245 unit + 17 browser tests stayed green); rebuild Storybook and verify all 18 stories render with zero console errors.
47. [x] Show the source of every example by enabling Storybook's Code panel: set `parameters.docs.codePanel = true` in `examples/.storybook/preview.ts` so it applies to all stories (the recommended project-wide location); rebuild `site/storybook` and verify the Code tab renders alongside the canvas for each story.

## Phases

## Phase 1 — Math core and Matrix4

- [x] Complete: T1, T2, T3, T4, T5

## Phase 2 — Transform core

- [x] Complete: T6, T7, T8, T9

## Phase 3 — Animation definitions and keyframes

- [x] Complete: T10, T11, T12, T13, T14

## Phase 4 — Easing, interpolation, and sampling

- [x] Complete: T15, T16, T17

## Phase 5 — Scheduling and playback instances

- [x] Complete: T18, T19, T20

## Phase 6 — Playback controls, repetition, and lifecycle

- [x] Complete: T21, T22, T23, T24, T25, T26

## Phase 7 — Render adapters

- [x] Complete: T27, T28, T29, T30, T31

## Phase 8 — GPU adapters and composition

- [x] Complete: T32, T33, T34

## Phase 9 — Rotation tracks, groups, and extensions

- [x] Complete: T35, T36, T37

## Phase 10 — Documentation foundation and API reference

- [x] Complete: T38, T39, T40

## Phase 11 — Storybook of examples

- [x] Complete: T41, T42

## Phase 12 — GitHub Pages integration and deploy QA

- [x] Complete: T43, T44, T45

## Phase 13 — Storybook runtime fixes

- [x] Complete: T46

## Phase 14 — Storybook code panel

- [x] Complete: T47
