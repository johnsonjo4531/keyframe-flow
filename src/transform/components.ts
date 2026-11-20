import type { Quaternion } from "./quaternion.ts";
import type { Vector3 } from "./vector3.ts";

/**
 * The canonical component representation of a transform (§4.3): position,
 * quaternion rotation, and scale. Shared by the transform and matrix
 * subsystems; declared as a pure type so neither module depends on the other
 * at runtime.
 */
export interface TransformComponents {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}
