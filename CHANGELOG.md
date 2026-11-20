# Changelog

All notable changes to this project are documented in this file. The format
follows a keep-a-changelog style and the version numbers follow
[Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## 0.0.0

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
