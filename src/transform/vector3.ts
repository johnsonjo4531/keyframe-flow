/**
 * Any value that can be read as a 3D vector.
 */
export type Vector3Like =
  | Readonly<{ x: number; y: number; z: number }>
  | readonly [number, number, number];

/**
 * An immutable 3D vector in the library's right-handed coordinate system (§4.4).
 *
 * All operations return new vectors; instances are never mutated (§4.2).
 */
export class Vector3 {
  readonly x: number;
  readonly y: number;
  readonly z: number;

  constructor(x = 0, y = 0, z = 0) {
    this.x = x;
    this.y = y;
    this.z = z;
  }

  static zero(): Vector3 {
    return new Vector3(0, 0, 0);
  }

  /** Coerces a tuple or `{x, y, z}` object into a `Vector3`. */
  static from(value: Vector3Like): Vector3 {
    if ("x" in value) {
      return new Vector3(value.x, value.y, value.z);
    }
    const [x, y, z] = value;
    return new Vector3(x, y, z);
  }

  /** Component-wise addition. Returns a new vector. */
  add(other: Vector3Like): Vector3 {
    const v = other instanceof Vector3 ? other : Vector3.from(other);
    return new Vector3(this.x + v.x, this.y + v.y, this.z + v.z);
  }

  /** Uniform scaling by a scalar, or per-axis scaling by a vector. */
  scale(factor: number | Vector3Like): Vector3 {
    if (typeof factor === "number") {
      return new Vector3(this.x * factor, this.y * factor, this.z * factor);
    }
    const v = Vector3.from(factor);
    return new Vector3(this.x * v.x, this.y * v.y, this.z * v.z);
  }

  /** Dot product. */
  dot(other: Vector3Like): number {
    const v = other instanceof Vector3 ? other : Vector3.from(other);
    return this.x * v.x + this.y * v.y + this.z * v.z;
  }

  /** Right-handed cross product `this × other`. */
  cross(other: Vector3Like): Vector3 {
    const v = other instanceof Vector3 ? other : Vector3.from(other);
    return new Vector3(
      this.y * v.z - this.z * v.y,
      this.z * v.x - this.x * v.z,
      this.x * v.y - this.y * v.x,
    );
  }

  /** Euclidean length. */
  length(): number {
    return Math.sqrt(this.dot(this));
  }

  /** Squared length (avoids a square root for comparisons). */
  lengthSquared(): number {
    return this.dot(this);
  }

  /**
   * Returns a unit-length copy pointing in the same direction.
   * Throws on zero-length vectors rather than producing NaN (§9.2 spirit:
   * never silently approximate).
   */
  normalize(): Vector3 {
    const len = this.length();
    if (len === 0) {
      throw new Error("Cannot normalize a zero-length vector.");
    }
    return new Vector3(this.x / len, this.y / len, this.z / len);
  }

  equals(other: Vector3Like, epsilon = 0): boolean {
    const v = other instanceof Vector3 ? other : Vector3.from(other);
    return (
      Math.abs(this.x - v.x) <= epsilon &&
      Math.abs(this.y - v.y) <= epsilon &&
      Math.abs(this.z - v.z) <= epsilon
    );
  }

  toArray(): [number, number, number] {
    return [this.x, this.y, this.z];
  }
}
