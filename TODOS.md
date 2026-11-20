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

10. [ ] Define keyframe types: `Keyframe<T> { at, value }` and `TransformKeyframe { at, transform, easing? }` with normalized `at` in `[0, 1]` (§6.1).
11. [ ] Implement `Animation.from()` with eager keyframe normalization: support arrays, synchronous iterables, generator instances, and functions returning iterables; generators run exactly once per definition, and playback instances share the normalized timeline (§5.4, §5.5).
12. [ ] Implement keyframe validation: finite numbers in `[0, 1]`, strictly increasing, no duplicates; empty throws, single keyframe yields constant animation, missing endpoints hold first/last value, out-of-order/duplicate/invalid timestamps throw, keyframes never silently reordered (§6.3).
13. [ ] Implement from/to definitions (`from`, `to`, `duration` in ms, optional `easing`) normalized into the same underlying timeline (§5.2, §6.2).
14. [ ] Implement property-level from/to definitions (partial `{ position, rotation, ... }`) normalized into transform representation; unspecified properties preserved from explicit starting transform or documented identity defaults (§7).
15. [ ] Implement easing: built-in named linear/ease-in/ease-out/ease-in-out variants, custom `(progress) => number` functions without global registration, animation-level default plus per-keyframe segment easing controlling interpolation to the next keyframe (§8).
16. [ ] Implement property-aware interpolation: linear for translation and scale, quaternion SLERP with normalization and shortest-path default for 3D rotation, angular interpolation for 2D rotation; raw element-wise matrix interpolation is not the default (§9, §9.1).
17. [ ] Implement manual sampling: `animation.sample(ms)` and `animation.sampleProgress(0..1)` evaluating the same timeline, equivalent results (e.g. 500ms of 2000ms == 0.25 progress), out-of-range inputs clamped, no scheduler or render target required (§10).

## Milestone 3: Playback Engine

18. [ ] Define injectable `Clock { now() }` and `Scheduler { request(cb); cancel(handle) }` interfaces with a browser `requestAnimationFrame` default plus test/Node-friendly alternatives (§16).
19. [ ] Implement the centralized scheduler: drives all active playbacks, timestamp-based time progression (never frame-count), rate changes preserve continuity relative to current timestamp, no unnecessary updates when nothing is active (§16).
20. [ ] Implement `animation.attach(target?)` creating independent playback instances with their own execution state and lifecycle; attachment without a target must work for pure time control (§11).
21. [ ] Implement playback controls per the `Playback` interface: `play`, `pause`, `reverse`, `seek(ms)`, `seekProgress(p)`; play on finished restarts from beginning in current direction; pausing retains time (§11.1, §12).
22. [ ] Implement `playbackRate` as a settable property with no time discontinuities on change (§11.1, §12, §16).
23. [ ] Implement repetition and direction: single, finite (total count includes the initial iteration), infinite (never naturally completes), reverse, and alternate playback — handled by the engine, not duplicated keyframes (§13).
24. [ ] Implement completion behavior: per-run `finished` promise resolving `{ status: "finished" | "cancelled" }` (resolve, never reject, on ordinary cancel); `cancel()` retains last rendered transform; `dispose()` idempotent; operations on disposed instances throw (§11.1, §12).
25. [ ] Implement target replacement semantics: one active transform-producing playback owns a target; starting another supersedes the existing one; no implicit additive composition (§14).
26. [ ] Write lifecycle tests with fake clock/scheduler covering all states (idle, running, paused, finished, cancelled, disposed), every transition in the §12 table, repetition/direction behavior, and determinism (§12, §13, §21).

## Milestone 4: Render Adapters

27. [ ] Define the structural `RenderTarget { setTransform(matrix); dispose?() }` interface — custom targets need no library base class; adapters own rendering state only, never playback time or lifecycle (§17.1, §17.2, §3.6).
28. [ ] Implement `target.html(element)` adapter: matrix conversion to CSS `transform`, transform-origin and existing-transform handling (§17, §17.3).
29. [ ] Implement `target.svg(element)` adapter for SVG transform attributes (§17).
30. [ ] Implement `target.canvas(context)` adapter for Canvas 2D, including the required projection step rather than forwarding a raw 4×4 matrix (§17.3).
31. [ ] Write adapter behavior tests: custom structural targets work without modifying the engine, and disposing playback never destroys the underlying element/canvas/context (§17.2, §21).

## Milestone 5: Advanced Capabilities

32. [ ] Implement a WebGL render adapter (§3.6, §20 M5).
33. [ ] Implement a WebGPU render adapter (§3.6, §20 M5).
34. [ ] Implement property-level composition via property tracks so independent animations can affect different properties simultaneously, with `Animation.combine([move, rotate, scale])` as a convenience layer on top (§14).
35. [ ] Implement advanced angular rotation tracks enabling full revolutions without intermediate keyframes (§9.1).
36. [ ] Implement animation groups and nested timelines (§14, §19).
37. [ ] Add explicit advanced raw-matrix interpolation option for non-decomposable transforms (shear/perspective), failing explicitly rather than approximating (§9.2), plus additional matrix/interpolation extensions as needed.

## Phases

## Phase 1 — Math core and Matrix4

- [x] Complete: T1, T2, T3, T4, T5

## Phase 2 — Transform core

- [x] Complete: T6, T7, T8, T9

## Phase 3 — Animation definitions and keyframes

- [ ] Complete: T10, T11, T12, T13, T14

## Phase 4 — Easing, interpolation, and sampling

- [ ] Complete: T15, T16, T17

## Phase 5 — Scheduling and playback instances

- [ ] Complete: T18, T19, T20

## Phase 6 — Playback controls, repetition, and lifecycle

- [ ] Complete: T21, T22, T23, T24, T25, T26

## Phase 7 — Render adapters

- [ ] Complete: T27, T28, T29, T30, T31

## Phase 8 — GPU adapters and composition

- [ ] Complete: T32, T33, T34

## Phase 9 — Rotation tracks, groups, and extensions

- [ ] Complete: T35, T36, T37
