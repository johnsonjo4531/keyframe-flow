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
  readonly m11: number;
  readonly m12: number;
  readonly m13: number;
  readonly m14: number;
  readonly m21: number;
  readonly m22: number;
  readonly m23: number;
  readonly m24: number;
  readonly m31: number;
  readonly m32: number;
  readonly m33: number;
  readonly m34: number;
  readonly m41: number;
  readonly m42: number;
  readonly m43: number;
  readonly m44: number;
}

/** A mutable `DOMMatrix` instance with the subset of members used here. */
export interface DOMMatrixWritable extends DOMMatrixLike {
  m11: number;
  m12: number;
  m13: number;
  m14: number;
  m21: number;
  m22: number;
  m23: number;
  m24: number;
  m31: number;
  m32: number;
  m33: number;
  m34: number;
  m41: number;
  m42: number;
  m43: number;
  m44: number;

  readonly is2D: boolean;
  readonly isIdentity: boolean;

  multiply(other: DOMMatrixLike): DOMMatrixWritable;
  transformPoint(point: { x: number; y: number; z?: number; w?: number }): {
    x: number;
    y: number;
    z: number;
    w: number;
  };
  toFloat32Array(): Float32Array;
  toFloat64Array(): Float64Array;
}

declare global {
  /** Present only in environments that provide the DOMMatrix API. */
  var DOMMatrix: (new () => DOMMatrixWritable) | undefined;
}

export {};
