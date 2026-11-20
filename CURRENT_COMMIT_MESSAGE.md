feat(core): transform and matrix foundations (Milestone 1, T1–T9)

Establish the coordinate-convention core of keyframe-flow per
design-docs/vision.md §4, §9, and §15.

- Tooling: Vite+ library build, Node Vitest suite, Chromium browser suite
  (`vitest.browser.config.ts`), playground, `.gitignore`; all Makefile
  targets pass.
- `Vector3`: immutable primitives with right-handed cross product; explicit
  throw when normalizing a zero vector.
- `Quaternion`: axis-angle and Euler (intrinsic X→Y→Z, radians) construction,
  Hamilton multiply, conjugate, normalize, rotateVector, shortest-path slerp.
- `Matrix4`: right-handed, column vectors, column-major storage; TRS compose/
  decompose; strict A × B multiply; cofactor inversion with singular throw;
  DOMMatrix and Float32Array conversions that preserve mathematical meaning
  (CSSOM `m<column><row>` named members), never raw element copies. Runs in
  plain Node with zero browser APIs (§2 principle 1).
- Explicit throws for unsupported decompositions: shear, reflection,
  perspective, singular (§9.2, §15.1).
- `Transform`: frozen canonical `{ position, rotation, scale }` components;
  Euler accepted only as radians construction interface; negative scale
  rejected; every operation returns a new transform (§4.2, §4.3).
- Fluent and declarative construction; fluent ops apply in call order as
  local-space operations (`M ← M × Op`); parent-to-child composition is
  `Parent × Local`; world-space ops act in the parent frame (§4.4).
- Tests: 62 unit tests (conventions, layout, order, round-trips, throws,
  immutability, composition) + 7 browser interop tests against native
  `DOMMatrix` (transformPoint agreement, multiplication order, array layout,
  round-trips).

feat(animation): animation definitions, easing, interpolation, sampling (Milestone 2, T10–T17)

Deliver the animation-definition layer of keyframe-flow per
design-docs/vision.md §5–§10: immutable Animation definitions with eager
keyframe normalization, validation, easing, property-aware interpolation,
and first-class manual sampling — all runnable in plain Node with zero
browser APIs (§2 principle 1).

- Keyframe types: `Keyframe<T>` and `TransformKeyframe { at, transform,
  easing? }` with normalized `at ∈ [0, 1]`, independent of ms duration
  (§6.1, §6.2).
- `Animation.from()`: from/to, property-level, static-keyframe, iterable,
  generator-instance, and generator-function sources; iterables consumed
  eagerly and exactly once per definition into a frozen shared timeline;
  async iterables rejected explicitly (§5.1–§5.5).
- Validation (§6.3): finite `[0, 1]` timestamps, strictly increasing, no
  duplicates, empty throws, single keyframe is constant, missing endpoints
  hold first/last value, never silently reordered; durations must be
  finite non-negative ms (§6.2).
- Property-level definitions (§7): partial `{ position, rotation, scale }`
  merged into canonical TRS; unspecified properties preserved from the
  explicit start or documented identity defaults.
- Easing (§8): 26 named built-ins (linear + CSS ease curves via a cubic-
  bezier solver + sine/quad/cubic/quart/quint/expo/circ families), custom
  functions without registration, animation default plus per-keyframe
  segment easing controlling interpolation to the next keyframe; unknown
  names throw eagerly.
- Interpolation (§9): linear translation/scale, quaternion SLERP with
  normalization and shortest-path default, angular interpolation for pure-
  Z 2D rotations; raw element-wise matrix interpolation never default —
  midpoints always decompose cleanly to TRS (§9.1).
- Manual sampling (§10): `sample(ms)` / `sampleProgress(p)` evaluate the
  same timeline (500 ms of 2000 ms == 0.25 progress), clamp out-of-range
  inputs, return authored transforms on exact hits, throw on non-finite
  inputs, require no scheduler or render target, and never mutate the
  definition.
- Tests: +107 unit tests (169 total) covering generator determinism,
  shared timelines, all validation rules, merge semantics, easing curve
  values and precedence, SLERP/2D angular equivalence, matrix-interp
  non-default behavior, and sampling equivalence/clamping/holds. All
  Makefile targets pass (`vp check`, unit + Chromium suites).

feat(playback): playback engine with scheduler, lifecycle, and repetition (Milestone 3, T18–T26)

Deliver the playback subsystem of keyframe-flow per design-docs/vision.md
§11–§14 and §16: independent playback instances driven by a centralized,
injectable scheduler — all runnable in plain Node with zero browser APIs at
import time (§2 principle 1).

- Timing (§16): injectable `Clock`/`Scheduler` interfaces kept separate
  (scheduling is not timekeeping); `systemClock`, rAF-based
  `createFrameScheduler()` with a Node timer fallback resolved lazily, and
  deterministic `ManualClock`/`ManualScheduler` for tests.
- `PlaybackEngine`: centralized scheduler driving all active playbacks from
  one frame request; timestamp-based progression (never frame-count); stops
  requesting frames when nothing is active; injectable clock/scheduler with a
  lazy shared default engine.
- `animation.attach(target?, options?)` → independent `Playback` instances
  sharing the immutable timeline; targetless attachment works for pure time
  control (§11). Options: iterations, direction, playbackRate, autoplay, engine.
- Full §11.1/§12 surface: play/pause/reverse/seek/seekProgress/cancel/dispose,
  `state`, `currentTime` (per-iteration ms), settable `playbackRate` with no
  discontinuities, per-run `finished` promise resolving finished|cancelled
  (never rejects), restart-from-beginning-in-current-direction on finished,
  cancel retains last rendered transform, dispose idempotent + throws after.
- Repetition & direction in the engine (§13): single/finite (incl. initial
  iteration)/infinite, reverse, alternate & alternate-reverse across multiple
  boundary crossings per frame; zero-duration runs complete instantly; keyframe
  duplication never happens.
- Target replacement semantics (§14) over the structural `RenderTarget`
  interface (§17.1 groundwork): latest playback owns a target, superseded
  owners are cancelled, no additive composition, targets are never destroyed
  by disposal (Appendix B.8).
- Tests: +31 unit tests (200 total) covering scheduler contracts and frame
  economy, every §12 transition, rate continuity, repetition/alternate
  behavior, supersede rules, disposal semantics, and determinism. Unit,
  browser, lint, format, and type checks all green.

feat(targets): html, svg, and canvas 2D render adapters (Milestone 4, T27–T31)

Deliver the render-adapter layer of keyframe-flow per design-docs/vision.md
§17: structural target ownership with deterministic, adapter-owned rendering
state — no browser APIs required at import time (§2 principle 1).

- `RenderTarget { setTransform(matrix); dispose?() }` (§17.1): custom
  rendering systems need no library base class or imports; adapters own
  rendering state only and never playback time or lifecycle (§3.6, §17.2).
  `Playback.dispose()` runs the optional cleanup hook but never destroys host
  resources (Appendix B.8).
- `target.html(element)`: CSS `matrix3d()` in column-major argument order
  (no transposition), replaces pre-existing inline transform since the
  adapter owns the property, optional one-time `transformOrigin` (§17.3).
- `target.svg(element)`: SVG 1.1 `matrix(a, b, c, d, e, f)` attribute mapped
  from column vectors; comma-separated so the same string is valid CSS too.
- `target.canvas(context)`: explicit `projectToCanvas2D` projection step —
  homogeneous images of the origin and X/Y basis through perspective
  division with an optional camera distance — instead of forwarding a raw
  4×4 Canvas cannot apply (§17.3); affine inputs reduce exactly to their
  affine part; `setTransform` owns the context CTM deterministically.
- Tests: +7 unit tests for conversion/projection math and +9 Chromium
  browser tests (207 unit, 16 browser total) verifying real DOM/canvas
  interop via the browser's own CSS parser (`DOMMatrix`) and context CTMs,
  custom structural targets with zero engine changes, supersede/dispose
  ownership, and that disposal leaves elements, contexts, and custom objects
  fully intact (§17.2, §21).

feat(core): GPU adapters, composition, angular rotation, raw-matrix mode (Milestone 5, T32–T37)

Deliver the advanced-capabilities layer of keyframe-flow per
design-docs/vision.md §9 and §14: GPU render adapters, property-track
composition, full-revolution rotation tracks, groups, and an explicit raw
matrix interpolation escape hatch — all runnable in plain Node (§2
principle 1).

- `target.webgl(options)` / `target.webgpu(options)` (§3.6): own only the
  latest transform as a column-major `Float32Array` matching GLSL `mat4` and
  WGSL `mat4x4<f32>` upload layouts (§15), plus an optional `onTransform`
  hook; create no GPU resources, never touch playback time or lifecycle,
  destroy nothing on dispose (Appendix B.8); allocation-free
  `copyMatrixValuesTo` for hot paths (§2.9). Verified against a real WebGL
  context: evaluated playback → `gl.uniformMatrix4fv` → `gl.getUniform`
  round-trip in the Chromium suite.
- Property tracks (§14): `animatedProperties` detects actually-changing
  properties (including wobble returning to start);
  `Animation.combine([move, rotate, scale])` merges per property — inputs
  override only what they animate, later inputs win overlaps, no additive
  composition, shorter inputs hold their final value after completion.
- Angular rotation tracks (§9.1): `rotationMode: "angular"` interpolates
  authored Euler radians component-wise so 0 → 2π is one full revolution
  without intermediate keyframes; authored `[x, y, z]` rotations captured
  verbatim during eager normalization; new `Quaternion#toEuler` (inverse of
  intrinsic X→Y→Z `fromEuler`, documented gimbal-lock convention) round-trip
  verified over a deterministic 250-orientation sweep.
- Groups and nested timelines (§14, §19): `Animation.group()` sequences over
  summed duration; `{ layout: "parallel" }` merges like combine; groups are
  ordinary Animations so nesting composes naturally.
- Raw-matrix interpolation (§9.2): explicit `interpolation: "raw-matrix"`
  via element-wise `Matrix4#lerp`; non-TRS-decomposable results (shear from
  interpolated rotations) throw explicitly rather than approximating;
  conflicting option combinations throw at definition time.
- Tests: +38 unit tests and +1 browser test (245 unit, 17 browser total)
  covering composition precedence and hold behavior, nested groups, full
  revolutions vs quaternion collapse, gimbal-lock decomposition, raw-matrix
  throws, and GPU adapter contracts. Unit, browser, lint, format, and type
  checks all green.

docs(site): guides, TypeDoc reference, Storybook examples, Pages site (Milestone 6, T38–T45)

Deliver the user-facing documentation surface specified by
design-docs/vision.md §20 M6: prose guides, a strict-TypeDoc API reference,
a live example storybook, and one unified GitHub Pages site.

- Guides (`docs/`): getting started, core concepts & coordinate conventions
  (§4.4), animation authoring (§5), easing & interpolation (§8–§9), playback
  & lifecycle (§11–§13), render adapters & custom targets (§17), plus
  contributing-docs.md describing the docs pipeline; frontmatter
  title/group/order drives sidebar grouping; README.md links the published
  site and keeps design-docs/vision.md as internal source of truth.
- API reference: TypeDoc + @clean-jsdoc-theme/typedoc via typedoc.json —
  entry src/index.ts → site/docs, basePath /keyframe-flow/docs, siteUrl for
  sitemap, docs/docGroups prose sidebar, menu link to the storybook, strict
  mode with notDocumented + invalidLink validation; zero warnings. All 113
  previously-undocumented public exports documented with @param/@returns and
  runnable @example blocks; inline type literals extracted into named
  exported interfaces (Vector3Object, QuaternionObject, DOMPointInput/Output,
  PlaybackFinishedResult/CancelledResult) so they can carry JSDoc. JSDoc
  summaries made link-free (the theme renders them as plain text in meta
  tags and pagination cards); link-bearing prose moved under @remarks.
- Storybook examples: real Storybook 10 (React renderer, @storybook/react-vite)
  in examples/.storybook; 18 stories covering §5/§7 definition styles,
  keyframe + generator sources, the full 26-easing gallery plus custom
  curves, SLERP-vs-angular rotation comparison (§9), manual-sampling external
  loop (§10.3), lifecycle/repetition/target-supersede (§11–§13), and all
  five built-in adapters plus a structural custom target (§17). Shared
  playback-story.tsx hook mounts live animations with duration/easing/
  transport controls; absolute keyframe-flow → src alias keeps stories on the
  working tree; examples/tsconfig.json type-checks stories and configs.
- Pages site: single `site/` staging — docs + storybook side by side,
  self-contained landing page (docs/site-index.html), `.nojekyll` preserved
  via gh-pages --dotfiles. Storybook 10 has no base-path flag; builder-vite
  emits subpath-portable relative assets, so the build needs none. Makefile:
  build-docs parks site-index.html out of the theme's docs walker,
  typecheck-examples added, github_pages_deploy validated (push not run).
- QA: automated audit of the built site — 7.7k root-absolute + 22 relative
  hrefs and 742 in-page anchors with zero broken targets; no raw {@link}
  text leaks into rendered pages or meta descriptions; local preview under a
  /keyframe-flow/ prefix serves every surface and asset (200); mobile
  viewport + dark-mode sanity across all three surfaces. Unit (245),
  browser (17), lint, format, examples typecheck all green.
