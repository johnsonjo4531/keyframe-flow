/**
 * Minimal structural declarations for the parts of `DOMMatrix` the library
 * interoperates with (§15.2).
 *
 * The core must run without browser APIs (§2 principle 1), so the full DOM
 * lib is intentionally not referenced. Declaring `DOMMatrix` as possibly
 * `undefined` encodes that platform availability directly in the type system:
 * every use site must handle environments where it does not exist.
 */

/**
 * The named members shared by `DOMMatrixReadOnly` and `DOMMatrix`.
 *
 * CSSOM member names are transposed relative to conventional mathematical
 * `m<row><column>` naming: `mXY` is the element at math row `Y − 1`,
 * column `X − 1`. (`transformPoint` computes
 * `x' = x·m11 + y·m21 + z·m31 + m41`, so the translation lives in
 * `m41/m42/m43`.) See §15.2 — conversions must preserve mathematical meaning,
 * not raw element order.
 */
export interface DOMMatrixLike {
  /** CSSOM `m11` — math row 1, column 1 (basis image of x̂, x part). */
  readonly m11: number;
  /** CSSOM `m12` — math row 2, column 1 (basis image of x̂, y part). */
  readonly m12: number;
  /** CSSOM `m13` — math row 3, column 1 (basis image of x̂, z part). */
  readonly m13: number;
  /** CSSOM `m14` — math row 4, column 1 (x basis perspective term). */
  readonly m14: number;
  /** CSSOM `m21` — math row 1, column 2 (basis image of ŷ, x part). */
  readonly m21: number;
  /** CSSOM `m22` — math row 2, column 2 (basis image of ŷ, y part). */
  readonly m22: number;
  /** CSSOM `m23` — math row 3, column 2 (basis image of ŷ, z part). */
  readonly m23: number;
  /** CSSOM `m24` — math row 4, column 2 (y basis perspective term). */
  readonly m24: number;
  /** CSSOM `m31` — math row 1, column 3 (basis image of ẑ, x part). */
  readonly m31: number;
  /** CSSOM `m32` — math row 2, column 3 (basis image of ẑ, y part). */
  readonly m32: number;
  /** CSSOM `m33` — math row 3, column 3 (basis image of ẑ, z part). */
  readonly m33: number;
  /** CSSOM `m34` — math row 4, column 3 (z basis perspective term). */
  readonly m34: number;
  /** CSSOM `m41` — math row 1, column 4: translation x. */
  readonly m41: number;
  /** CSSOM `m42` — math row 2, column 4: translation y. */
  readonly m42: number;
  /** CSSOM `m43` — math row 3, column 4: translation z. */
  readonly m43: number;
  /** CSSOM `m44` — math row 4, column 4: homogeneous coordinate (usually 1). */
  readonly m44: number;
}

/** Input point for `DOMMatrixWritable#transformPoint`. */
export interface DOMPointInput {
  /** X coordinate. */
  x: number;
  /** Y coordinate. */
  y: number;
  /** Z coordinate; defaults to 0. */
  z?: number;
  /** Homogeneous coordinate; defaults to 1. */
  w?: number;
}

/** Point produced by `DOMMatrixWritable#transformPoint`. */
export interface DOMPointOutput {
  /** Transformed X (perspective-divided when `w ≠ 1`). */
  x: number;
  /** Transformed Y. */
  y: number;
  /** Transformed Z. */
  z: number;
  /** Homogeneous coordinate of the result. */
  w: number;
}

/** A mutable `DOMMatrix` instance with the subset of members used here. */
export interface DOMMatrixWritable extends DOMMatrixLike {
  /** CSSOM `m11` — math row 1, column 1 (writable). */
  m11: number;
  /** CSSOM `m12` — math row 2, column 1 (writable). */
  m12: number;
  /** CSSOM `m13` — math row 3, column 1 (writable). */
  m13: number;
  /** CSSOM `m14` — math row 4, column 1 (writable). */
  m14: number;
  /** CSSOM `m21` — math row 1, column 2 (writable). */
  m21: number;
  /** CSSOM `m22` — math row 2, column 2 (writable). */
  m22: number;
  /** CSSOM `m23` — math row 3, column 2 (writable). */
  m23: number;
  /** CSSOM `m24` — math row 4, column 2 (writable). */
  m24: number;
  /** CSSOM `m31` — math row 1, column 3 (writable). */
  m31: number;
  /** CSSOM `m32` — math row 2, column 3 (writable). */
  m32: number;
  /** CSSOM `m33` — math row 3, column 3 (writable). */
  m33: number;
  /** CSSOM `m34` — math row 4, column 3 (writable). */
  m34: number;
  /** CSSOM `m41` — translation x (writable). */
  m41: number;
  /** CSSOM `m42` — translation y (writable). */
  m42: number;
  /** CSSOM `m43` — translation z (writable). */
  m43: number;
  /** CSSOM `m44` — homogeneous coordinate (writable). */
  m44: number;

  /** True when every perspective-related entry is at its identity value. */
  readonly is2D: boolean;
  /** True when the matrix is exactly the identity. */
  readonly isIdentity: boolean;

  /** Short alias for `m11` — 2D affine scale-x (§17). */
  a: number;
  /** Short alias for `m12` — 2D affine skew/skew-y component. */
  b: number;
  /** Short alias for `m21` — 2D affine skew/skew-x component. */
  c: number;
  /** Short alias for `m22` — 2D affine scale-y (§17). */
  d: number;
  /** Short alias for `m41` — 2D affine translation x. */
  e: number;
  /** Short alias for `m42` — 2D affine translation y. */
  f: number;

  /** Returns `this × other` as a new matrix (CSSOM order). */
  multiply(other: DOMMatrixLike): DOMMatrixWritable;

  /** Applies the transform to `point`, returning a new point. */
  transformPoint(point: DOMPointInput): DOMPointOutput;

  /** The 16 entries in CSSOM array order (`a11, a12, …` row-major text). */
  toFloat32Array(): Float32Array;

  /** The 16 entries in CSSOM array order, double precision. */
  toFloat64Array(): Float64Array;
}

declare global {
  /** Present only in environments that provide the DOMMatrix API. */
  var DOMMatrix:
    | (new (init?: string | Float32Array | Float64Array | number[]) => DOMMatrixWritable)
    | undefined;
}

export {};
