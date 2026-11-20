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
