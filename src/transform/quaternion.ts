import { Vector3, type Vector3Like } from "./vector3.ts";

/**
 * Any value that can be read as a quaternion `{x, y, z, w}`.
 */
export type QuaternionLike = Readonly<{ x: number; y: number; z: number; w: number }>;

/**
 * An immutable unit-friendly quaternion used as the library's internal
 * rotation representation (§4.3). Components follow the Hamilton convention
 * `(x, y, z, w)` with `w` as the scalar part.
 *
 * Multiplication follows matrix conventions for column vectors:
 * `a.multiply(b)` produces the rotation that applies `b` first and then `a`,
 * mirroring `A × B` in §4.4.
 */
export class Quaternion {
  readonly x: number;
  readonly y: number;
  readonly z: number;
  readonly w: number;

  constructor(x = 0, y = 0, z = 0, w = 1) {
    this.x = x;
    this.y = y;
    this.z = z;
    this.w = w;
  }

  static identity(): Quaternion {
    return new Quaternion(0, 0, 0, 1);
  }

  /**
   * Creates a quaternion from Euler angles in radians (§4.3).
   *
   * Angles are applied as intrinsic rotations in X → Y → Z order (each about
   * the frame produced by the previous rotation), which is equivalent to the
   * matrix product `Rx · Ry · Rz` acting on column vectors.
   */
  static fromEuler(x: number, y: number, z: number): Quaternion {
    const qx = Quaternion.fromAxisAngle([1, 0, 0], x);
    const qy = Quaternion.fromAxisAngle([0, 1, 0], y);
    const qz = Quaternion.fromAxisAngle([0, 0, 1], z);
    return qx._multiplyRaw(qy)._multiplyRaw(qz);
  }

  /**
   * Creates a quaternion for a rotation of `angle` radians about `axis` using
   * the right-hand rule (§4.4). The axis is normalized first.
   */
  static fromAxisAngle(axis: Vector3Like, angle: number): Quaternion {
    const normalized = Vector3.from(axis).normalize();
    const half = angle / 2;
    const s = Math.sin(half);
    return new Quaternion(normalized.x * s, normalized.y * s, normalized.z * s, Math.cos(half));
  }

  /** Coerces a `{x, y, z, w}` object into a `Quaternion`. */
  static from(value: QuaternionLike): Quaternion {
    if (value instanceof Quaternion) return value;
    return new Quaternion(value.x, value.y, value.z, value.w);
  }

  /**
   * Hamilton product `this ⊗ other` — the rotation that applies `other` first,
   * then `this`. Returns a new quaternion.
   */
  multiply(other: QuaternionLike): Quaternion {
    const q = Quaternion.from(other);
    return this._multiplyRaw(q);
  }

  /** Internal non-coercing product; never exposed so inputs stay immutable. */
  _multiplyRaw(q: Quaternion): Quaternion {
    return new Quaternion(
      this.w * q.x + this.x * q.w + this.y * q.z - this.z * q.y,
      this.w * q.y - this.x * q.z + this.y * q.w + this.z * q.x,
      this.w * q.z + this.x * q.y - this.y * q.x + this.z * q.w,
      this.w * q.w - this.x * q.x - this.y * q.y - this.z * q.z,
    );
  }

  /** Euclidean norm of the four components. */
  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z + this.w * this.w);
  }

  /** Returns a unit-length copy. Throws on zero-length quaternions. */
  normalize(): Quaternion {
    const len = this.length();
    if (len === 0) {
      throw new Error("Cannot normalize a zero-length quaternion.");
    }
    return new Quaternion(this.x / len, this.y / len, this.z / len, this.w / len);
  }

  /** The conjugate; for unit quaternions this is also the inverse. */
  conjugate(): Quaternion {
    return new Quaternion(-this.x, -this.y, -this.z, this.w);
  }

  /** Dot product of the four components (cosine between unit orientations). */
  dot(other: QuaternionLike): number {
    const q = Quaternion.from(other);
    return this.x * q.x + this.y * q.y + this.z * q.z + this.w * q.w;
  }

  /**
   * Spherical linear interpolation toward `other` at parameter `t ∈ [0, 1]`.
   *
   * Inputs are normalized before use and the shortest path on the 4D sphere
   * is taken by default (§9.1). Endpoints reproduce the inputs exactly.
   */
  slerp(other: QuaternionLike, t: number): Quaternion {
    const a = this.normalize();
    const b = Quaternion.from(other).normalize();

    let cosHalf = a.dot(b);
    let bx = b.x;
    let by = b.y;
    let bz = b.z;
    let bw = b.w;

    // Take the shorter arc (shortest-path default, §9.1).
    if (cosHalf < 0) {
      cosHalf = -cosHalf;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }

    // Near-identical orientations: fall back to normalized lerp to avoid a
    // zero-divide in the sine term.
    if (cosHalf >= 1 - 1e-12) {
      return new Quaternion(
        a.x + t * (bx - a.x),
        a.y + t * (by - a.y),
        a.z + t * (bz - a.z),
        a.w + t * (bw - a.w),
      ).normalize();
    }

    const half = Math.acos(Math.min(1, cosHalf));
    const sinHalf = Math.sin(half);
    const wa = Math.sin((1 - t) * half) / sinHalf;
    const wb = Math.sin(t * half) / sinHalf;

    return new Quaternion(
      wa * a.x + wb * bx,
      wa * a.y + wb * by,
      wa * a.z + wb * bz,
      wa * a.w + wb * bw,
    );
  }

  /** Rotates a vector by this quaternion: `v' = q · v · q*`. */
  rotateVector(v: Vector3Like): Vector3 {
    const q = this.normalize();
    const p = Vector3.from(v);
    // Standard optimized form: t = 2 (q_vec × v), v' = v + w·t + q_vec × t.
    const tx = 2 * (q.y * p.z - q.z * p.y);
    const ty = 2 * (q.z * p.x - q.x * p.z);
    const tz = 2 * (q.x * p.y - q.y * p.x);
    return new Vector3(
      p.x + q.w * tx + (q.y * tz - q.z * ty),
      p.y + q.w * ty + (q.z * tx - q.x * tz),
      p.z + q.w * tz + (q.x * ty - q.y * tx),
    );
  }

  equals(other: QuaternionLike, epsilon = 0): boolean {
    const q = Quaternion.from(other);
    // q and -q describe the same orientation; compare without a sign flip so
    // callers control normalization explicitly.
    return (
      Math.abs(this.x - q.x) <= epsilon &&
      Math.abs(this.y - q.y) <= epsilon &&
      Math.abs(this.z - q.z) <= epsilon &&
      Math.abs(this.w - q.w) <= epsilon
    );
  }

  toArray(): [number, number, number, number] {
    return [this.x, this.y, this.z, this.w];
  }
}
