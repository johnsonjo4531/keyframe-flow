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

## Milestone 8: Storybook Reset Control & GPU Example Fixes

Discovered via Playwright inspection of the Storybook dev server: the WebGL and WebGPU target stories never create a playback at all — their readouts sit frozen at `state: idle / t = 0 ms` and every transport button is inert.

48. [x] Add a reset control to the shared story transport in `examples/stories/playback-story.tsx`: a `reset()` on `useKeyframePlayback` that seeks playback back to progress 0 and restores forward direction — if the instance is currently flipped (via `reverse()`, §12–§13), flip it back so a subsequent `play()` runs 0 → 1 rather than in reverse (§12: restarts use the current direction). Expose it as a `reset` button on `Transport` so all stories using the shared transport get it; also re-sync the frame-mirrored readout when transport controls are pressed, since the mirror loop stops whenever playback is not running and would otherwise show stale state after reset/seek. Playwright-verify: finish or reverse a run, press reset then play, and watch `t` advance from 0 to duration forward.
49. [x] Fix the WebGL and WebGPU Storybook examples (`examples/stories/targets/webgl-target.stories.tsx`, `webgpu-target.stories.tsx`): both call `useKeyframePlayback` but never attach `handle.hostRef` to any element, so the hook's effect early-returns on a null host — no playback instance is ever created, transport buttons silently do nothing, and the uniform upload/write readouts stay empty. Attach `hostRef` to each story's layout wrapper (the same pattern as the custom-target story: host for layout only, adapter ignores it), then verify with Playwright that both stories autoplay, animate on their GPU paths (moving quad / live translation values), and report zero console errors. Playwright investigation also surfaced an engine defect this exposed: button-restarted runs could complete instantly because a frame callback can deliver a timestamp older than the anchor taken in `play()` (input dispatched inside an already-started frame), and a run always begins exactly on a timeline boundary, so even a few ms of negative delta crosses it in one step — `Playback.onEngineUpdate` must ignore non-forward timestamps (§16), with unit-test regression coverage.

## Milestone 9: Interactive Documentation Examples

The docs guides (`docs/*.md`, rendered by TypeDoc + clean-jsdoc-theme v5) explain every concept with static code blocks, while the runnable versions live in a separate Storybook surface. Readers should be able to play the examples without leaving the page they are reading.

50. [x] Add interactive playable examples to the documentation: embed live Storybook stories directly into the guides using clean-jsdoc-theme v5's `iframe` embed fence (```iframe with `<url> key=value` config — the theme only accepts `https://` or protocol-relative `//` URLs, so use protocol-relative `//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=<story-id>` which resolves same-origin on GitHub Pages _and_ against a locally served site under the `/keyframe-flow/` path prefix). Embed at least one runnable story per relevant guide section (getting-started, core-concepts, animation-authoring, easing-interpolation, playback-lifecycle, render-adapters), each with `title`, an appropriate `height`, and `themed=false`; pair every embed with an "Open in Storybook" link so readers can also reach the full story with arg controls. Document the pattern in `docs/contributing-docs.md`. Rebuild `site/docs` (`make build-docs`) and verify with Playwright — serving `site/` under a `/keyframe-flow/` prefix so protocol-relative embed URLs hit the locally built Storybook — that every embedded story loads and animates inside the docs pages with zero console errors. Playwright verification surfaced a second engine defect: in _nested_ iframes, rAF callback timestamps can stall relative to the realm's `performance.now()`, and because `PlaybackEngine._requestFrame` stepped playbacks by the scheduler callback argument while `play()` anchors from `clock.now()`, the non-forward guard skipped every update and runs froze at `t = 0` — violating Appendix B.7 ("the engine reads timestamps from a Clock rather than trusting callback arguments"). The engine now dispatches `clock.now()` to playbacks (callback argument ignored), with a unit regression test; the guard in `onEngineUpdate` remains as defense against non-monotonic custom clocks.

## Milestone 10: React Component Helpers, Vanilla Examples & Link Fixes

The docs now embed playable examples, but three gaps remain: markdown links with missing closing parens render as raw text; every live example is React-based while the library's core value proposition is framework-free TypeScript; and "Open in Storybook" deep links use `?id=`, which the Storybook manager ignores — it lands on the first story instead of the linked one. This milestone fixes the links, adds a first-class `keyframe-flow/react` subpath with dedicated component helpers used throughout Storybook, gives every example a vanilla-TypeScript twin hosted in a standalone Vite examples gallery at `/keyframe-flow/examples/`, and points docs deep links at the exact stories they show.

51. [x] Fix unclosed markdown links: README.md line 22 (vision/concepts link ends with `.` instead of `)`) and the docs table rows (~lines 77–83, each `[title](url` never closed before the table pipe), plus `docs/core-concepts.md` "API reference" bullets (`[`Transform`](../transform//,` — three links missing their closing paren). Audit every markdown file (`README.md`, `docs/*.md`, `TODOS.md`, `CHANGELOG.md`) for the same class of breakage (a `](` whose destination is never closed on the line), fix them all, rebuild `site/docs`, and verify with Playwright that no page renders a stray unclosed-link literal.
52. [x] Add dedicated React component helpers to the library as a new `keyframe-flow/react` subpath (`src/react/`): promote the Storybook-only `useKeyframePlayback` plumbing into a public API — a `useKeyframePlayback(animation, options)` hook (host ref, live state mirror with control-kick sync, transport controls incl. forward-facing `reset()`) plus an `<Animated>` element helper that renders a host div wired through `target.html` by default. Wire package `exports`, the Vite lib build entry (`react`), and `peerDependencies` for React; keep the core tree (and its DOM-free tsconfig) untouched by excluding `src/react` from the core project and type-checking it with the examples/browser setup instead. Cover the hook's attach/reattach/dispose lifecycle and controls with a browser test.
53. [x] Use the new React helpers throughout Storybook: every story that builds playback via the old local `useKeyframePlayback` in `examples/stories/playback-story.tsx` switches to the library subpath (story-side helpers keep only example chrome — transport buttons, readout — not the engine plumbing), keeping identical behavior for autoplay, re-attach on arg changes, and the reset/reverse semantics. Document the React integration in a new guide (`docs/react-integration.md`): `useKeyframePlayback` and `<Animated>` with runnable snippets, plus links from the existing guides' "what to read next" lists.
54. [x] Give every Storybook example a vanilla-TypeScript twin (pure-TS implementation modules, no React imports) using only `keyframe-flow` + DOM APIs, driven through a shared imperative transport/readout harness mirroring the React one. The original single-story `implementation`-arg switcher was reverted: `useArgs` is unavailable outside story render/decorators (it crashed every canvas when rendered via `meta.component`), and Storybook binds one UI renderer per build (`react-vite` here) so plain-DOM stories would need a separate `@storybook/html` project anyway. Storybook therefore stays React-only; the vanilla twins live in their own gallery site (T56).
55. [x] Fix "Open in Storybook" deep links to land on the exact story being shown: the manager ignores bare `?id=<story-id>` (it redirects to whichever story was last/first opened and yields a broken `iframe.html?id=*` canvas); rewrite all 19 guide links to the canonical `?path=/story/<story-id>` form, verify each with Playwright that the loaded canvas matches the linked story id, and update the link convention in `docs/contributing-docs.md`.
56. [x] Build a standalone vanilla-TypeScript example gallery served at `/keyframe-flow/examples/` (the docs' home for framework-free examples, since Storybook's single-renderer architecture can't host plain-TS stories alongside React ones): a small Vite app under `examples/gallery/` with a landing page listing every example by section, and hash-routed subpages (`#/example/<id>`) each showing the live vanilla animation demo alongside its source code, with a toggle between the TypeScript implementation and the React twin (sources pulled in via Vite `?raw` imports). Build it to `site/examples/` with base `/keyframe-flow/examples/` via a Makefile target wired into the site build; add "Vanilla TypeScript" links from each docs guide embed to its gallery page, revert the `&args=implementation:vanilla` embed pins (the arg no longer exists), and document the layout + per-example registration convention in `docs/contributing-docs.md`.
57. [x] Add a `make preview-site` target that serves the built `site/` directory locally (single command, e.g. via `pnpm dlx serve site` with a documented fallback) so docs, Storybook, and the examples gallery can be browsed together at `http://localhost:4173/keyframe-flow/` without rebuilding or deploying; note it in `docs/contributing-docs.md`.

## Milestone 11: Documentation-Local Links, Guide-Aligned Examples & Gallery Polish

58. [x] Fix locally-broken documentation links and embeds: (a) guide anchor links ("Open in Storybook", "▶ Vanilla TypeScript implementation") hardcode the published `johnsonjo4531.github.io` host, so a locally served site jumps to GitHub Pages instead of staying on `/keyframe-flow/*` — extend `docs/embed-host-rewrite.js` to rewrite those anchors (and iframes) to same-origin paths when not running on the published host; (b) Storybook embeds showed "No Preview" under `make preview-site` because `serve` 301-redirects `*.html` and drops query strings — switch the target to Python's stdlib server (done in Makefile) and verify every guide embed renders its story locally.
59. [x] Make Storybook examples mirror the documentation: create new stories that reproduce the guides' actual code snippets verbatim where no matching example exists (`guides-getting-started--first-animation`, `guides-getting-started--sample-without-playing` sampling the same `slide` definition, `guides-core-concepts--crane-vs-orbit` for composition order), align existing embedded stories' default values with their guide snippets (from/to, keyframes→bounce, generators orbit, combine tracks, slerp-vs-angular full revolution), replace the two unrelated getting-started embeds and the core-concepts embed with the new guide stories, give every story a substantive Docs description explaining what it demonstrates and linking its guide section, and update vanilla twins + gallery registry for any new/renamed ids.
60. [x] Polish the examples gallery (`/keyframe-flow/examples/`): add a light/dark theme toggle in the header (persisted to localStorage, following `prefers-color-scheme` by default) applied via CSS custom properties across landing and example pages, and syntax-highlight all code panels (TypeScript + TSX sources) with a proper highlighter instead of plain `<pre>` text.

## Milestone 12: LLM-Readable Documentation (llms.txt)

61. [x] Publish machine-readable docs indexes for AI tools: enable clean-jsdoc-theme's `llmsTxt` option in `typedoc.json` so the docs build emits `llms.txt` (an llmstxt.org index — one section per sidebar group, each entry linking the page's companion Markdown) and `llms-full.txt` (all page bodies concatenated) at the docs root (`/keyframe-flow/docs/llms.txt`, `/keyframe-flow/docs/llms-full.txt`); verify both files list every guide and API page with absolute published-host URLs; link them in the documentation so people know they exist and how to use them — a short "AI & LLM tools" section in `docs/getting-started.md` explaining the llms.txt convention (hand the index to any model, or the full file when context budget allows) with links to both files, a note in `docs/contributing-docs.md` that new pages appear in the indexes automatically via their companion `.md`, and menu discoverability if the theme supports it cleanly.

## Milestone 13: Pinned Vanilla Examples Link in Docs & Landing Page

The vanilla-TypeScript examples gallery lives at `/keyframe-flow/examples/` (T56) but is only reachable from links buried inside individual guide embeds. It should be discoverable the same way Storybook is — a pinned external link on every documentation page — and called out on the site landing page.

62. [x] Pin the vanilla-TypeScript examples gallery as an external menu link on every docs page: add a `{ "title": "Vanilla TS", "link": "/keyframe-flow/examples/", "icon": ... }` entry to `cleanJsdocTheme.menu` in `typedoc.json` — the same mechanism that pins Storybook into the header nav of every generated page; also add a third card linking to `/keyframe-flow/examples/` on the landing page (`docs/site-index.html`) alongside Documentation and Storybook, describing it as the framework-free examples gallery. Rebuild `site/docs`, verify the menu item renders in the built HTML nav, and confirm both links resolve to `/keyframe-flow/examples/`.

## Milestone 14: Timeline API (vision.md addendum)

`design-docs/vision.md` gained a Timeline addendum (§3.7, §13.1, §14.1–§14.4, §16.1, §19.1, §20.1, §21.1, Appendix A.1/B.1/C): a platform-independent temporal composition definition that schedules multiple animation/timeline definitions over one shared time axis — absolute placement, sequence, parallel, nesting, compact repetition at segment and whole-timeline level, staggering, deterministic sampling, and Timeline Playback through the existing centralized scheduler — without changing the meaning of `Animation`/`Playback`/`Scheduler`/`RenderTarget` (Appendix B.1). Implement following the §20.1 development order; the illustrative snippets are not final signatures but stay close to them where practical.

63. [x] Core Timeline definition and child-entry representation (§3.7, Appendix A.1): a new `src/timeline/` module with an immutable `Timeline` class holding eagerly normalized frozen entries `{ name?, source: Animation | Timeline, at (ms), target?, repeat {iterations, direction, delay}, duration }`; validate children are only `Animation`/`Timeline` instances, finite non-negative placement times and delays; expose `duration`; the definition is DOM-free and timer-free — pure data (§2 principle 1).
64. [x] Composition forms (§14.1): `Timeline.from({ name: { animation, target?, at } })` for absolute placement (bare `Animation`/`Timeline` values accepted as shorthand), `Timeline.sequence(children, { gap? })` placing children back to back by their intrinsic durations plus an optional gap, `Timeline.parallel(children)` starting children together with independent durations; nested timelines are first-class children and compose naturally; sequence must explicitly reject an infinite-duration child that would make later siblings unreachable (§14.3); placement never re-times or normalizes child durations.
65. [x] Repetition semantics & repeat segments (§13.1, §14.2): one consistent options shape — `iterations` is the total count including the first (finite positive integers only; `"infinite"`/`Infinity` explicit and non-completing), `direction` normal/alternate (+ reverse modes for parity with playback), `delay` is the gap _between_ iterations and never delays the first; `Timeline.repeat(child, { iterations, delay?, direction? })` returns a compact single-entry timeline wrapping the child — repeated segments are repeat operations, never eagerly expanded per iteration (§14.2); alternate reverses progress without snapping to the beginning between alternating iterations (§13.1).
66. [x] Stagger helper (§14.1): `Timeline.stagger(child, items, { delay, order? })` where `items` is a count or an array of render targets (each entry binds one), expanding into ordinary scheduled entries at `i × delay` with explicit `"forward"`/`"reverse"` ordering — no special runtime node; it compiles to the same scheduling model everything else uses.
67. [x] Deterministic sampling & duration calculation (§14.3, §14.4): finite timelines expose `duration = max(at + repeatedDuration)` with per-entry repeat duration `D × N + R × (N − 1)` (delay omitted after the final iteration); an infinite parallel child yields infinite duration; `timeline.sample(timeMs)` evaluates every started child at `childLocalTime = timeMs − childStart` with no scheduler — unstarted children produce nothing, completed children follow their endpoint behavior, repeat mapping handles delay-gap holds and alternate direction, nested timelines flatten into `{ name?, target?, localTime, transform }` samples; same-target children keep replacement semantics resolved by explicit entry order, never additive composition (§14.4).
68. [x] Timeline playback through the existing scheduler (§16.1): `timeline.attach(options?)` creates a `TimelinePlayback` owning one shared transport — play/pause/reverse/seek(ms)/seekProgress(p)/playbackRate/cancel/dispose plus the per-run `finished` promise — with §12 lifecycle parity to `Playback`; it registers as a single scheduled unit on the centralized `PlaybackEngine`, children derive local time from the shared timeline time and never create their own clocks (Appendix B.1); playback-level repetition composes independently with segment repeats (§14.2, §16.1); every entry target follows §14 replacement semantics — starting supersedes existing playbacks on those targets — and disposal never destroys adapter-owned render objects (Appendix B.8).
69. [x] Timeline QA: unit tests across the whole surface (placement/sequence-gap/parallel/nesting, duration formula incl. repeat delays and infinite parallel, sequence rejecting unreachable infinite children, repeat mapping — gap holds, alternate ping-pong, `Infinity`, outer × inner repeat composition, stagger ordering, sampling determinism with before-start/completed edges, same-target ordering, playback lifecycle via the `ManualClock`/`ManualScheduler` harness incl. supersede); full JSDoc with runnable `@example`s on every export so TypeDoc passes `strict: true`; export from `src/index.ts`; `make test` green.

## Milestone 15: Timeline Documentation, Stories & Vanilla Twins

The Timeline API (Milestone 14) currently exists only as the generated API reference. Following the Milestones 6/9/10 pattern, it needs a prose guide in the docs sidebar with playable embeds, Storybook stories demonstrating the composition forms, and vanilla-TypeScript twins registered in the examples gallery.

70. [x] Author Storybook stories for the Timeline API under `examples/stories/timeline/`: **Sequence** (entrance: logo → heading → subtitle with gap), **Parallel** (infinite repeating background spin + finite children with independent durations), **Stagger** (card fan with delay interval and forward/reverse order), and **Repeat** (alternate ping-pong pulse + repeated sequence with repeat delay) — one story per composition form, each driving several real host elements through `Timeline.from`/entry targets and the shared transport/readout chrome. The timeline plumbing lives in a small story-side helper (`useTimelinePlayback` in `examples/stories/timeline-story.tsx`) mirroring the library hook's attach/re-attach/dispose + frame-mirrored readout semantics; stories stay example chrome, engine stays in the library. Every story gets a substantive Docs description linking its guide section; ids follow the existing `<section>-<name>--<story>` convention for deep links.
71. [x] Give every Timeline story a vanilla-TypeScript twin (`examples/vanilla/timeline-*.ts`, no React imports — pure `keyframe-flow` + DOM) driven through the shared harness, widening `mountTransport` to a structural playback contract so it accepts both `Playback` and `TimelinePlayback`; register all four in the gallery (`examples/gallery/examples.ts`) with live mounts, story-default args, and `?raw` sources for the TS ↔ React twin toggle.
72. [x] Write the prose guide `docs/timeline-choreography.md` ("Timeline & Choreography", Guides group — order 6 ahead of React Integration, which becomes 7; authored as `docs/timeline.md` but renamed because the `/keyframe-flow/docs/timeline/` slug belongs to the generated `Timeline` API page): the definition/playback boundary table from §3.7/Appendix B.1, authoring forms with snippets matching the embedded stories (`from`, `sequence` + gap, `parallel`, `stagger`, `repeat`), duration rules incl. the `D × N + R × (N − 1)` formula and infinite-child handling (§14.3), deterministic sampling and same-target replacement ordering (§14.4), and Timeline Playback over the shared scheduler with §12 transport parity (§16.1). Embed one live story per section via the iframe fence with paired "Open in Storybook" (`?path=/story/`) and "▶ Vanilla TypeScript implementation" gallery links, following `docs/contributing-docs.md` conventions; cross-link from the guides' "what to read next" lists.
73. [x] Verify end-to-end: rebuild `site/docs`, `site/storybook`, and `site/examples`; Playwright-check that every new story renders and animates with zero console errors, each guide embed loads its exact story locally under the `/keyframe-flow/` prefix, and each gallery page mounts its live demo with both source tabs; note the Timeline section in `docs/contributing-docs.md`'s registration conventions. `make test` stays green.

## Milestone 16: Performance Stress Test Examples

Every example so far animates a handful of elements, which doesn't show what the library does under load — one centralized scheduler driving many playbacks (§16) is exactly where its performance story lives. Add stress-test examples to both surfaces (Storybook and the vanilla-TypeScript gallery) that animate large numbers of elements and let the user dial the load up interactively to feel how well the engine scales.

74. [x] Add a Storybook stress-test story (`examples/stories/performance/stress-test.stories.tsx`): animate many host elements (HTML divs through `target.html`, staggered via `Timeline.stagger` or per-element playbacks) with a Storybook arg control for the starting element count, plus interactive controls to add more animated elements at runtime (e.g. +10 / +100 / custom-count buttons) without recreating the existing playbacks — new elements attach on the fly and join the running animation. Include a live performance readout in the story chrome: element/active-playback count, measured FPS, and average frame time (via `performance.now()` deltas in a rAF mirror loop), so the cost of scaling up is visible as you click. Keep engine plumbing in the library (shared transport/readout chrome pattern from `playback-story.tsx`); stories stay example chrome.

75. [x] Give the stress test its vanilla-TypeScript twin (`examples/vanilla/stress-test.ts`, no React imports — pure `keyframe-flow` + DOM) driven through the shared harness, with the same interactive "add more animated elements" controls (button UI in the mount, count/FPS/frame-time readout), and register it in the gallery (`examples/gallery/examples.ts`) with its live mount and `?raw` TS ↔ React twin sources following the existing per-example registration convention.

76. [x] Verify the stress examples: Playwright-check that both surfaces render with zero console errors and that adding elements mid-run animates them immediately without stalling or duplicating existing playbacks (dispose on unmount tears down every playback — no leaked scheduled units); sanity-sweep element counts (e.g. 100 → 1,000+) and confirm FPS stays reasonable at scale with the centralized scheduler; note the new story/gallery ids in `docs/contributing-docs.md` registration conventions and cross-link the stress test from the performance-relevant guide section(s). `make test` stays green.

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

## Phase 15 — Storybook reset control and GPU example fixes

- [x] Complete: T48, T49

## Phase 16 — Interactive documentation examples

- [x] Complete: T50

## Phase 17 — React helpers, vanilla example twins & link fixes

- [x] Complete: T51, T52, T53, T54, T55, T56, T57

## Phase 18 — Documentation-local links, guide-aligned examples & gallery polish

- [x] Complete: T58, T59, T60

## Phase 19 — LLM-readable documentation (llms.txt)

- [x] Complete: T61

## Phase 20 — Pinned vanilla examples link in docs & landing page

- [x] Complete: T62

## Phase 21 — Timeline definition core

- [x] Complete: T63, T64, T65, T66, T67

## Phase 22 — Timeline playback & QA

- [x] Complete: T68, T69

## Phase 23 — Timeline documentation, stories & vanilla twins

- [x] Complete: T70, T71, T72, T73

## Phase 24 — Performance stress test examples

- [x] Complete: T74, T75, T76
