import { Quaternion } from "../transform/quaternion.ts";
import { Vector3, type Vector3Like } from "../transform/vector3.ts";
import type { TransformComponents } from "../transform/components.ts";
import type { DOMMatrixLike, DOMMatrixWritable } from "../types.d.ts";

/**
 * Absolute tolerance below which matrix components are treated as zero.
 */
const ZERO_EPSILON = 1e-9;

/** Relative tolerance for orthonormality checks during decomposition. */
const ORTHONORMAL_EPSILON = 1e-6;

/**
 * The library's portable, canonical 4×4 matrix (§3.4, §15).
 *
 * Conventions (§4.4): right-handed coordinates, column vectors, column-major
 * storage, radians for angular values. Element `(row r, column c)` lives at
 * index `c × 4 + r`, so the translation components sit at indices 12, 13, 14 —
 * matching WebGL/GLSL and `DOMMatrix`'s column-major array layout (§15.2).
 *
 * Instances are immutable; every operation returns a new matrix (§4.2).
 *
 * @example
 * ```ts
 * import { matrix, Quaternion } from "keyframe-flow";
 *
 * const m = matrix.fromTRS({ position: [10, 0, 0], rotation: Quaternion.identity() });
 * m.el(12); // 10 — translation x at column-major index 12 (§15)
 * ```
 */
export class Matrix4 {
  /** Column-major storage: index `column * 4 + row`. */
  private readonly elements: Float64Array;

  /**
   * Creates a matrix from 16 values in column-major order, or the identity
   * matrix when no values are given.
   */
  constructor(values?: ArrayLike<number>) {
    const elements = new Float64Array(16);
    if (values === undefined) {
      elements[0] = 1;
      elements[5] = 1;
      elements[10] = 1;
      elements[15] = 1;
    } else {
      if (values.length !== 16) {
        throw new RangeError(`Matrix4 requires exactly 16 values, received ${values.length}.`);
      }
      for (let i = 0; i < 16; i++) {
        const value = Number(values[i]);
        if (!Number.isFinite(value)) {
          throw new RangeError(`Matrix4 requires finite values; index ${i} is ${values[i]}.`);
        }
        elements[i] = value;
      }
    }
    this.elements = elements;
  }

  /** The identity matrix — multiplying by it changes nothing. */
  static identity(): Matrix4 {
    return new Matrix4();
  }

  /** Creates a matrix from 16 values in column-major order. */
  static fromArray(values: ArrayLike<number>): Matrix4 {
    return new Matrix4(values);
  }

  /**
   * Creates a matrix from a `Float32Array` interpreted as column-major values.
   * Precision may be reduced relative to the library's internal double
   * precision; this is inherent to the source format (§15.2).
   */
  static fromFloat32Array(values: Float32Array): Matrix4 {
    return new Matrix4(values);
  }

  /** Returns a column-major `Float32Array` copy (e.g. for GPU uploads). */
  toFloat32Array(): Float32Array {
    return Float32Array.from(this.elements);
  }

  /** Returns a column-major number-array copy. */
  toArray(): number[] {
    return Array.from(this.elements);
  }

  /**
   * Creates a matrix from anything exposing the named `DOMMatrix` members
   * `m11`–`m44`. Conversions go through named members rather than raw array
   * copies so mathematical meaning survives storage-order differences
   * (§15.2).
   *
   * CSSOM names members as `m<column><row>` — the transpose of conventional
   * mathematical `m<row><column>` naming. `DOMMatrix` transforms points as
   * `x' = x·m11 + y·m21 + z·m31 + m41`, so member `mXY` corresponds to the
   * element at math row `Y − 1`, column `X − 1`. Reading members in name
   * order therefore yields exactly this library's column-major element
   * order; "re-correcting" it would silently transpose the matrix.
   */
  static fromDOMMatrix(other: DOMMatrixLike): Matrix4 {
    const named = [
      other.m11,
      other.m12,
      other.m13,
      other.m14, //
      other.m21,
      other.m22,
      other.m23,
      other.m24, //
      other.m31,
      other.m32,
      other.m33,
      other.m34, //
      other.m41,
      other.m42,
      other.m43,
      other.m44, //
    ];

    for (const value of named) {
      if (typeof value !== "number" || !Number.isFinite(value)) {
        throw new RangeError("DOMMatrix-like source has a non-finite named member.");
      }
    }

    // Under CSSOM's m<column><row> naming, members in name order already
    // match this library's column-major element order. Any "row/column
    // correction" here would silently transpose the matrix (§15.2).
    return new Matrix4(named);
  }

  /**
   * Converts to a native `DOMMatrix`, preserving mathematical meaning: the
   * returned matrix applies the same transform to column vectors.
   *
   * Throws when the environment provides no `DOMMatrix` constructor — callers
   * in browser-free environments should use `toFloat32Array()` or `toArray()`.
   */
  toDOMMatrix(): DOMMatrixWritable {
    const Ctor = globalThis.DOMMatrix;
    if (Ctor === undefined) {
      throw new Error(
        "DOMMatrix is not available in this environment. Use Matrix4#toFloat32Array() or Matrix4#toArray() instead.",
      );
    }

    const native = new Ctor();
    // Members are assigned in name order from column-major storage. CSSOM's
    // m<column><row> naming means member `mXY` holds the math element at row
    // `Y − 1`, column `X − 1` — so `m41/m42/m43` receive the translation,
    // exactly matching native transform semantics (§15.2). Assigning named
    // members (rather than using the 16-value constructor) avoids any
    // dependence on element-order conventions.
    native.m11 = this.el(0);
    native.m12 = this.el(1);
    native.m13 = this.el(2);
    native.m14 = this.el(3);
    native.m21 = this.el(4);
    native.m22 = this.el(5);
    native.m23 = this.el(6);
    native.m24 = this.el(7);
    native.m31 = this.el(8);
    native.m32 = this.el(9);
    native.m33 = this.el(10);
    native.m34 = this.el(11);
    native.m41 = this.el(12);
    native.m42 = this.el(13);
    native.m43 = this.el(14);
    native.m44 = this.el(15);
    return native;
  }

  /** Reads the element at `(row, column)`. */
  at(row: number, column: number): number {
    return this.el(column * 4 + row);
  }

  /** Internal raw storage read (indices are always in range internally). */
  private el(index: number): number {
    return this.elements[index] as number;
  }

  /**
   * Matrix product `this × other` in conventional mathematical notation with
   * column vectors (§4.4): the composed transform applies `other` first, then
   * `this`. Neither operand is modified.
   */
  multiply(other: Matrix4): Matrix4 {
    const out = new Float64Array(16);

    for (let c = 0; c < 4; c++) {
      for (let r = 0; r < 4; r++) {
        out[c * 4 + r] =
          this.el(r) * other.el(c * 4) +
          this.el(4 + r) * other.el(c * 4 + 1) +
          this.el(8 + r) * other.el(c * 4 + 2) +
          this.el(12 + r) * other.el(c * 4 + 3);
      }
    }

    // The constructor copies and validates; cheap for 16 doubles.
    return new Matrix4(out);
  }

  /**
   * Returns the inverse matrix. Throws when the matrix is singular, rather
   * than producing approximate values (§9.2).
   */
  invert(): Matrix4 {
    // Gauss-Jordan elimination with partial pivoting on an augmented row-major
    // working copy: m[row * 8 + column] holds the source element at
    // (row, column) for the left block and (row, column - 4) for the right.
    const m = new Float64Array(32);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        m[r * 8 + c] = this.at(r, c);
      }
    }
    for (let r = 0; r < 4; r++) {
      m[r * 8 + 4 + r] = 1;
    }

    let maxAbs = 0;
    for (let i = 0; i < 16; i++) {
      const v = Math.abs(this.elements[i] as number);
      if (v > maxAbs) maxAbs = v;
    }
    const pivotTolerance = Math.max(ZERO_EPSILON * ZERO_EPSILON, maxAbs * 1e-12);

    for (let col = 0; col < 4; col++) {
      let pivotRow = col;
      let pivotSize = Math.abs(m[col * 8 + col] as number);
      for (let r = col + 1; r < 4; r++) {
        const size = Math.abs(m[r * 8 + col] as number);
        if (size > pivotSize) {
          pivotSize = size;
          pivotRow = r;
        }
      }
      if (pivotSize <= pivotTolerance) {
        throw new Error("Cannot invert a singular matrix.");
      }

      if (pivotRow !== col) {
        for (let c = 0; c < 8; c++) {
          const tmp = m[col * 8 + c] as number;
          m[col * 8 + c] = m[pivotRow * 8 + c] as number;
          m[pivotRow * 8 + c] = tmp;
        }
      }

      const pivot = m[col * 8 + col] as number;
      for (let c = 0; c < 8; c++) {
        m[col * 8 + c] = (m[col * 8 + c] as number) / pivot;
      }

      for (let r = 0; r < 4; r++) {
        if (r === col) continue;
        const factor = m[r * 8 + col] as number;
        if (factor === 0) continue;
        for (let c = 0; c < 8; c++) {
          m[r * 8 + c] = (m[r * 8 + c] as number) - factor * (m[col * 8 + c] as number);
        }
      }
    }

    const out = new Float64Array(16);
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        out[c * 4 + r] = m[r * 8 + 4 + c] as number;
      }
    }
    return new Matrix4(out);
  }

  /**
   * Composes position, rotation, and scale into the canonical matrix
   * `T × R × S` (§3.3): a point is scaled first, then rotated, then translated.
   *
   * @example
   * ```ts
   * const m = Matrix4.fromTRS([10, 20, 0], Quaternion.identity(), [2, 2, 2]);
   * // Composes T × R × S — scale applies to the point first (§4.4).
   * ```
   */
  static fromTRS(position: Vector3Like, rotation: Quaternion, scale: Vector3Like): Matrix4 {
    const p = Vector3.from(position);
    const s = Vector3.from(scale);
    const q = rotation.normalize();

    // Rotation matrix columns (images of basis vectors), scaled per axis.
    const xx = q.x * q.x;
    const yy = q.y * q.y;
    const zz = q.z * q.z;
    const xy = q.x * q.y;
    const xz = q.x * q.z;
    const yz = q.y * q.z;
    const wx = q.w * q.x;
    const wy = q.w * q.y;
    const wz = q.w * q.z;

    const out = new Float64Array(16);

    // Column 0: R's first column times sx.
    out[0] = (1 - 2 * (yy + zz)) * s.x;
    out[1] = 2 * (xy + wz) * s.x;
    out[2] = 2 * (xz - wy) * s.x;
    // Column 1: R's second column times sy.
    out[4] = 2 * (xy - wz) * s.y;
    out[5] = (1 - 2 * (xx + zz)) * s.y;
    out[6] = 2 * (yz + wx) * s.y;
    // Column 2: R's third column times sz.
    out[8] = 2 * (xz + wy) * s.z;
    out[9] = 2 * (yz - wx) * s.z;
    out[10] = (1 - 2 * (xx + yy)) * s.z;
    // Column 3: translation.
    out[12] = p.x;
    out[13] = p.y;
    out[14] = p.z;
    out[15] = 1;

    return new Matrix4(out);
  }

  /**
   * Extracts `{ position, rotation, scale }` from this matrix when it is
   * mathematically decomposable into ordinary TRS components (§15.1).
   *
   * Throws explicitly for matrices containing shear, reflection, perspective,
   * or singular components instead of silently approximating them (§9.2).
   */
  decompose(): TransformComponents {
    const scaleOf = (column: number) =>
      Math.hypot(this.el(column * 4), this.el(column * 4 + 1), this.el(column * 4 + 2));

    // Perspective components live in the bottom row (indices 3, 7, 11) and the
    // homogeneous divisor at index 15.
    const perspective = [3, 7, 11].some((i) => Math.abs(this.el(i)) > ZERO_EPSILON);
    if (perspective || Math.abs(this.el(15) - 1) > ZERO_EPSILON) {
      throw new Error(
        "Matrix contains perspective components and cannot be decomposed into TRS. Use the matrix directly.",
      );
    }

    const sx = scaleOf(0);
    const sy = scaleOf(1);
    const sz = scaleOf(2);
    if (sx <= ZERO_EPSILON || sy <= ZERO_EPSILON || sz <= ZERO_EPSILON) {
      throw new Error(
        "Matrix is singular (a basis column has zero length) and cannot be decomposed.",
      );
    }

    // Signed volume of the parallelepiped: negative determinant means a
    // reflection, near-zero means degeneracy. Both are rejected explicitly.
    const c0 = this.column(0);
    const c1 = this.column(1);
    const c2 = this.column(2);
    const det =
      c0[0] * (c1[1] * c2[2] - c1[2] * c2[1]) -
      c0[1] * (c1[0] * c2[2] - c1[2] * c2[0]) +
      c0[2] * (c1[0] * c2[1] - c1[1] * c2[0]);

    if (Math.abs(det) <= ZERO_EPSILON * sx * sy * sz) {
      throw new Error("Matrix is singular and cannot be decomposed into TRS.");
    }
    if (det < 0) {
      throw new Error(
        "Matrix contains a reflection (negative determinant) which ordinary TRS components cannot represent. Use the matrix directly.",
      );
    }

    // Shear check: after dividing each column by its scale, columns must be
    // mutually orthogonal. Deviation is measured relative to the product of
    // the two column lengths so it stays scale-aware.
    const dot = (a: readonly [number, number, number], b: readonly [number, number, number]) =>
      a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
    const skewed =
      Math.abs(dot(c0, c1)) > ORTHONORMAL_EPSILON * sx * sy ||
      Math.abs(dot(c0, c2)) > ORTHONORMAL_EPSILON * sx * sz ||
      Math.abs(dot(c1, c2)) > ORTHONORMAL_EPSILON * sy * sz;
    if (skewed) {
      throw new Error(
        "Matrix contains shear which cannot be represented as ordinary TRS components. Use the matrix directly.",
      );
    }

    const rotation = Matrix4._rotationQuaternion(
      c0[0] / sx,
      c0[1] / sx,
      c0[2] / sx,
      c1[0] / sy,
      c1[1] / sy,
      c1[2] / sy,
    );

    return {
      position: new Vector3(this.el(12), this.el(13), this.el(14)),
      rotation,
      scale: new Vector3(sx, sy, sz),
    };
  }

  /** The first three entries of the given column as a tuple. */
  private column(column: number): readonly [number, number, number] {
    return [this.el(column * 4), this.el(column * 4 + 1), this.el(column * 4 + 2)];
  }

  /** Applies the matrix to a point (implicit w = 1). */
  applyToPoint(point: Vector3Like): Vector3 {
    const p = Vector3.from(point);
    return new Vector3(
      this.el(0) * p.x + this.el(4) * p.y + this.el(8) * p.z + this.el(12),
      this.el(1) * p.x + this.el(5) * p.y + this.el(9) * p.z + this.el(13),
      this.el(2) * p.x + this.el(6) * p.y + this.el(10) * p.z + this.el(14),
    );
  }

  /** Applies the rotation/scale part to a direction vector (implicit w = 0). */
  applyToVector(vector: Vector3Like): Vector3 {
    const v = Vector3.from(vector);
    return new Vector3(
      this.el(0) * v.x + this.el(4) * v.y + this.el(8) * v.z,
      this.el(1) * v.x + this.el(5) * v.y + this.el(9) * v.z,
      this.el(2) * v.x + this.el(6) * v.y + this.el(10) * v.z,
    );
  }

  /** Element-wise comparison within `epsilon`. */
  equals(other: Matrix4, epsilon = 0): boolean {
    if (other instanceof Matrix4 === false) return false;
    for (let i = 0; i < 16; i++) {
      if (Math.abs(this.el(i) - other.el(i)) > epsilon) {
        return false;
      }
    }
    return true;
  }

  /**
   * Raw element-wise linear interpolation between two matrices — an explicit
   * advanced escape hatch (§9.2), never the default transform interpolation.
   * The result is generally not TRS-decomposable (interpolated rotations gain
   * shear); decompose it only when the inputs justify it, and accept the
   * explicit throw otherwise. See `Animation`'s `interpolation: "raw-matrix"`
   * option for animation-level use.
   */
  lerp(other: Matrix4, t: number): Matrix4 {
    if (!(other instanceof Matrix4)) {
      throw new TypeError("Matrix4#lerp() requires another Matrix4.");
    }
    if (typeof t !== "number" || !Number.isFinite(t)) {
      throw new TypeError("Matrix4#lerp() requires a finite interpolation parameter.");
    }
    const out = new Float64Array(16);
    for (let i = 0; i < 16; i++) {
      out[i] = (this.el(i) as number) + ((other.el(i) as number) - (this.el(i) as number)) * t;
    }
    return new Matrix4(out);
  }

  /**
   * Builds a quaternion from the first two normalized rotation columns of an
   * orthonormal, positively-oriented 3×3 block. The third column is implied by
   * the right-hand rule (§4.4).
   */
  private static _rotationQuaternion(
    r00: number,
    r10: number,
    r20: number,
    r01: number,
    r11: number,
    r21: number,
  ): Quaternion {
    // Third column = column0 × column1 (right-handed).
    const r02 = r10 * r21 - r20 * r11;
    const r12 = r20 * r01 - r00 * r21;
    const r22 = r00 * r11 - r10 * r01;

    const trace = r00 + r11 + r22;
    let x: number;
    let y: number;
    let z: number;
    let w: number;

    if (trace > 0) {
      const s = Math.sqrt(trace + 1) * 2;
      w = 0.25 * s;
      x = (r21 - r12) / s;
      y = (r02 - r20) / s;
      z = (r10 - r01) / s;
    } else if (r00 > r11 && r00 > r22) {
      const s = Math.sqrt(1 + r00 - r11 - r22) * 2;
      w = (r21 - r12) / s;
      x = 0.25 * s;
      y = (r01 + r10) / s;
      z = (r02 + r20) / s;
    } else if (r11 > r22) {
      const s = Math.sqrt(1 + r11 - r00 - r22) * 2;
      w = (r02 - r20) / s;
      x = (r01 + r10) / s;
      y = 0.25 * s;
      z = (r12 + r21) / s;
    } else {
      const s = Math.sqrt(1 + r22 - r00 - r11) * 2;
      w = (r10 - r01) / s;
      x = (r02 + r20) / s;
      y = (r12 + r21) / s;
      z = 0.25 * s;
    }

    return new Quaternion(x, y, z, w).normalize();
  }
}
