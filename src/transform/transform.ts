import { Matrix4 } from "../matrix/matrix4.ts";
import { Quaternion, type QuaternionLike } from "./quaternion.ts";
import { Vector3, type Vector3Like } from "./vector3.ts";

// The canonical component shape (§4.3) is shared with the matrix subsystem.
export type { TransformComponents } from "./components.ts";
import type { TransformComponents } from "./components.ts";

/** Canonical construction input; omitted (or undefined) parts default to identity. */
export interface TransformComponentsInit {
  position?: Vector3Like | undefined;
  rotation?: QuaternionLike | undefined;
  scale?: Vector3Like | undefined;
}

/**
 * Developer-facing construction input (§4.1). Rotation may be given as a
 * quaternion or as Euler angles in radians `[x, y, z]` — the convenience
 * construction interface from §4.3. Scale accepts a uniform number.
 */
export interface TransformInit {
  position?: Vector3Like;
  rotation?: QuaternionLike | readonly [number, number, number];
  scale?: Vector3Like | number;
}

/** Default epsilon used by `Transform#equals`. */
const EQUALS_EPSILON = 1e-9;

/**
 * An immutable transform with the canonical component representation
 * `{ position, rotation: Quaternion, scale }` (§4.3), available as the frozen
 * `components` property.
 *
 * Euler angles are accepted only as a construction interface in radians;
 * rotations are stored internally as quaternions (§4.3). Every operation
 * returns a new transform without modifying its source (§4.2).
 *
 * Composition follows §4.4 exactly: fluent operations are applied in call
 * order as local-space operations (right-multiplication, `M ← M × Op`), and
 * parent-to-child composition uses `Parent × Local`. When a composed result
 * cannot be represented as ordinary TRS components — for example rotation
 * appended after non-uniform scale, which introduces shear — the operation
 * throws explicitly rather than silently approximating (§4.3, §9.2). Use
 * `Matrix4` directly for such matrices.
 */
export class Transform {
  /** Canonical position/rotation/scale components; frozen and never mutated. */
  readonly components: Readonly<TransformComponents>;

  /** Creates a transform from canonical components; omitted parts default to identity. */
  constructor(components: TransformComponentsInit = {}) {
    const position = Vector3.from(components.position ?? [0, 0, 0]);
    const rotation = Quaternion.from(components.rotation ?? Quaternion.identity()).normalize();
    const scale = Vector3.from(components.scale ?? [1, 1, 1]);

    if (scale.x < 0 || scale.y < 0 || scale.z < 0) {
      throw new Error(
        "Negative scale components represent a reflection which ordinary TRS components cannot represent. Use Matrix4 directly.",
      );
    }

    this.components = Object.freeze({ position, rotation, scale });
  }

  /** Coerces developer-facing input (§4.1) into canonical components. */
  static fromInit(init: TransformInit): Transform {
    let rotation: Quaternion;
    if (init.rotation === undefined) {
      rotation = Quaternion.identity();
    } else if (Array.isArray(init.rotation)) {
      const [x, y, z] = init.rotation as [number, number, number];
      rotation = Quaternion.fromEuler(x, y, z);
    } else {
      rotation = Quaternion.from(init.rotation as QuaternionLike);
    }

    return new Transform({
      position: init.position,
      rotation,
      scale: typeof init.scale === "number" ? [init.scale, init.scale, init.scale] : init.scale,
    });
  }

  /** The matrix `T × R × S` for these components. */
  toMatrix(): Matrix4 {
    const { position, rotation, scale } = this.components;
    return Matrix4.fromTRS(position, rotation, scale);
  }

  /**
   * Creates a transform by decomposing a matrix into TRS components.
   * Throws explicitly for shear, reflection, perspective, or singular
   * matrices (§15.1).
   */
  static fromMatrix(matrix: Matrix4): Transform {
    return new Transform(matrix.decompose());
  }

  /**
   * Composes `parent × local` into a new transform (§4.4). The local
   * transform is interpreted in the parent's coordinate system. Throws when
   * the composed matrix is not representable as TRS components.
   */
  compose(local: Transform): Transform {
    return Transform.fromMatrix(this.toMatrix().multiply(local.toMatrix()));
  }

  static compose(parent: Transform, local: Transform): Transform {
    return parent.compose(local);
  }

  // ---------------------------------------------------------------------------
  // Local-space fluent operations (§4.1, §4.4)
  //
  // Each returns a new transform; the source is never modified (§4.2).
  // Operations are applied in call order as right-multiplications of the
  // transform's matrix.
  // ---------------------------------------------------------------------------

  /**
   * Translates by `(x, y, z)` along the object's local axes. Omitted
   * components default to zero. Equivalent to `M ← M × T`.
   */
  translate(x: number, y = 0, z = 0): Transform {
    const { position, rotation, scale } = this.components;
    const offset = rotation.rotateVector(scale.scale(new Vector3(x, y, z)));
    return new Transform({
      position: position.add(offset),
      rotation,
      scale,
    });
  }

  /** Rotates by `angle` radians about the local X axis (right-hand rule). */
  rotateX(angle: number): Transform {
    return this.rotate(Quaternion.fromAxisAngle([1, 0, 0], angle));
  }

  /** Rotates by `angle` radians about the local Y axis (right-hand rule). */
  rotateY(angle: number): Transform {
    return this.rotate(Quaternion.fromAxisAngle([0, 1, 0], angle));
  }

  /** Rotates by `angle` radians about the local Z axis (right-hand rule). */
  rotateZ(angle: number): Transform {
    return this.rotate(Quaternion.fromAxisAngle([0, 0, 1], angle));
  }

  /**
   * Appends a rotation in the object's local frame: `M ← M × R(q)`.
   * Throws when the result is not representable as TRS (non-uniform scale
   * followed by rotation produces shear, §9.2).
   */
  rotate(rotation: QuaternionLike): Transform {
    const q = Quaternion.from(rotation);
    return Transform.fromMatrix(this.toMatrix().multiply(Matrix4.fromTRS([0, 0, 0], q, [1, 1, 1])));
  }

  /**
   * Scales by `(x, y, z)` along the object's local axes; a single argument
   * scales uniformly. Equivalent to `M ← M × S` (exact: diagonal scales
   * compose component-wise).
   */
  scale(x: number, y = x, z = x): Transform {
    const { position, rotation, scale } = this.components;
    return new Transform({
      position,
      rotation,
      scale: scale.scale(new Vector3(x, y, z)),
    });
  }

  // ---------------------------------------------------------------------------
  // World-space operations (§4.4)
  //
  // These act in the parent coordinate system: `M ← Op × M`.
  // ---------------------------------------------------------------------------

  /** Translates by `(x, y, z)` along the parent's axes. */
  worldTranslate(x: number, y = 0, z = 0): Transform {
    const { position, rotation, scale } = this.components;
    return new Transform({
      position: position.add(new Vector3(x, y, z)),
      rotation,
      scale,
    });
  }

  /** Rotates by `angle` radians about the parent's X axis. */
  worldRotateX(angle: number): Transform {
    return this.worldRotate(Quaternion.fromAxisAngle([1, 0, 0], angle));
  }

  /** Rotates by `angle` radians about the parent's Y axis. */
  worldRotateY(angle: number): Transform {
    return this.worldRotate(Quaternion.fromAxisAngle([0, 1, 0], angle));
  }

  /** Rotates by `angle` radians about the parent's Z axis. */
  worldRotateZ(angle: number): Transform {
    return this.worldRotate(Quaternion.fromAxisAngle([0, 0, 1], angle));
  }

  /** Rotates in the parent coordinate system: `M ← R(q) × M` (exact). */
  worldRotate(rotation: QuaternionLike): Transform {
    const q = Quaternion.from(rotation);
    const { position, rotation: local, scale } = this.components;
    return new Transform({
      position: q.rotateVector(position),
      rotation: q.multiply(local),
      scale,
    });
  }

  /** Structural equality; rotations compare without quaternion sign ambiguity. */
  equals(other: Transform, epsilon = EQUALS_EPSILON): boolean {
    if (!(other instanceof Transform)) return false;
    const a = this.components;
    const b = other.components;
    const orientationMatch = Math.abs(Math.abs(a.rotation.dot(b.rotation)) - 1) <= epsilon;
    return (
      a.position.equals(b.position, epsilon) && a.scale.equals(b.scale, epsilon) && orientationMatch
    );
  }
}

/**
 * Creates an immutable transform (§4.1).
 *
 * ```ts
 * transform().translate(100, 50, 0).rotateY(Math.PI / 2).scale(2);
 * transform({ position: [100, 50, 0], rotation: [0, Math.PI / 2, 0], scale: [2, 2, 2] });
 * ```
 */
export function transform(components?: TransformInit): Transform {
  return components === undefined ? new Transform() : Transform.fromInit(components);
}
