/**
 * keyframe-flow — a platform-independent transform and animation library.
 *
 * Public imports (§18):
 *
 * ```ts
 * import { Animation, transform, matrix, target } from "keyframe-flow";
 * ```
 *
 * Milestone 1 provides the transform and matrix foundations: `transform`,
 * `matrix`, `Transform`, `Matrix4`, `Vector3`, and `Quaternion`. The core
 * never touches browser APIs (§2 principle 1); interoperability with native
 * matrices happens through explicit conversions (§15.2).
 */
export { transform, Transform, Vector3, Quaternion } from "./transform/index.ts";
export type {
  TransformInit,
  TransformComponentsInit,
  Vector3Like,
  QuaternionLike,
} from "./transform/index.ts";

export { matrix, Matrix4 } from "./matrix/index.ts";
export type {
  MatrixSource,
  TransformComponents,
  DOMMatrixLike,
  DOMMatrixWritable,
} from "./matrix/index.ts";
