import { Quaternion } from "../transform/quaternion.ts";
import { Vector3 } from "../transform/vector3.ts";
import { Transform } from "../transform/transform.ts";

/**
 * Property-aware interpolation (§9). Each transform property is interpolated
 * with the math suited to it — linear for translation and scale, quaternion
 * SLERP for 3D rotation, angular interpolation for 2D rotation — never by
 * raw element-wise interpolation of 4×4 matrices (§9, §9.2).
 */

/** Linear interpolation between two scalars. */
export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

/** Quaternions with only-Z components are treated as 2D rotations (§9). */
const PURE_Z_EPSILON = 1e-9;

const TAU = Math.PI * 2;

function lerpVector3(a: Vector3, b: Vector3, t: number): Vector3 {
  return new Vector3(lerp(a.x, b.x, t), lerp(a.y, b.y, t), lerp(a.z, b.z, t));
}

/** True when a quaternion represents a rotation about the Z axis only. */
function isPureZRotation(q: Quaternion): boolean {
  return Math.abs(q.x) <= PURE_Z_EPSILON && Math.abs(q.y) <= PURE_Z_EPSILON;
}

/** The signed rotation angle in radians of a pure-Z quaternion. */
function zRotationAngle(q: Quaternion): number {
  const n = q.normalize();
  return 2 * Math.atan2(n.z, n.w);
}

/**
 * Interpolates two rotations (§9.1). Pure Z-axis quaternions — the 2D case —
 * use direct angular interpolation with shortest-path wrapping; everything
 * else uses quaternion SLERP, which normalizes its inputs and takes the
 * shortest path by default.
 */
export function interpolateRotation(a: Quaternion, b: Quaternion, t: number): Quaternion {
  if (isPureZRotation(a) && isPureZRotation(b)) {
    const start = zRotationAngle(a);
    let delta = zRotationAngle(b) - start;
    // Wrap to the shortest arc in (-π, π] (§9.1).
    delta -= Math.round(delta / TAU) * TAU;
    return Quaternion.fromAxisAngle([0, 0, 1], start + t * delta);
  }
  return a.slerp(b, t);
}

/**
 * Interpolates two transforms property-by-property (§9): translation and
 * scale linearly, rotation via `interpolateRotation`. The result is
 * always a valid TRS transform; raw matrix averaging never happens.
 */
export function interpolateTransforms(a: Transform, b: Transform, t: number): Transform {
  const ca = a.components;
  const cb = b.components;
  return new Transform({
    position: lerpVector3(ca.position, cb.position, t),
    rotation: interpolateRotation(ca.rotation, cb.rotation, t),
    scale: lerpVector3(ca.scale, cb.scale, t),
  });
}

/** Euler angle triples in radians, X → Y → Z (§4.3). */
export type EulerAngles = readonly [number, number, number];

/**
 * Interpolates two transforms with an angular rotation track (§9.1): position
 * and scale interpolate linearly, while rotation interpolates the authored
 * Euler angle components directly in radians. Because angles are not reduced
 * to orientations first, a segment from `0` to `2π` performs one full
 * revolution instead of collapsing to a no-op — full revolutions without
 * intermediate keyframes.
 */
export function interpolateTransformsWithAngles(
  a: Transform,
  b: Transform,
  fromAngles: EulerAngles,
  toAngles: EulerAngles,
  t: number,
): Transform {
  const angles: [number, number, number] = [
    lerp(fromAngles[0], toAngles[0], t),
    lerp(fromAngles[1], toAngles[1], t),
    lerp(fromAngles[2], toAngles[2], t),
  ];
  const ca = a.components;
  const cb = b.components;
  return new Transform({
    position: lerpVector3(ca.position, cb.position, t),
    rotation: Quaternion.fromEuler(angles[0], angles[1], angles[2]),
    scale: lerpVector3(ca.scale, cb.scale, t),
  });
}
