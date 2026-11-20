import type { Quaternion } from "./quaternion.ts";
import type { Vector3 } from "./vector3.ts";

/**
 * The canonical component representation of a transform (§4.3): position,
 * quaternion rotation, and scale. Shared by the transform and matrix
 * subsystems; declared as a pure type so neither module depends on the other
 * at runtime.
 */
export interface TransformComponents {
  /** Translation component. */
  position: Vector3;
  /** Rotation component (unit quaternion). */
  rotation: Quaternion;
  /** Per-axis scale component; non-negative by construction (§4.3). */
  scale: Vector3;
}
