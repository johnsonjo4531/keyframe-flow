import { Matrix4 } from "./matrix4.ts";
import type { Quaternion } from "../transform/quaternion.ts";
import type { Vector3Like } from "../transform/vector3.ts";
import type {
  DOMMatrixLike,
  DOMMatrixWritable,
  DOMPointInput,
  DOMPointOutput,
} from "../types.d.ts";

/** Sources accepted by `matrix.from()`. */
export type MatrixSource = ArrayLike<number> | DOMMatrixLike;

function isMatrixSourceArray(source: MatrixSource): source is ArrayLike<number> {
  return (
    Array.isArray(source) ||
    ArrayBuffer.isView(source) ||
    typeof (source as ArrayLike<number>).length === "number"
  );
}

/**
 * Portable matrix entry points (§15).
 *
 * ```ts
 * const a = matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 0, 0, 1]);
 * const b = matrix.from(domMatrix);
 * const result = a.multiply(b);
 * ```
 */
export const matrix = {
  /**
   * Creates a `Matrix4` from 16 column-major values, or from anything with
   * the named `DOMMatrix` members `m11`–`m44`. Conversions preserve
   * mathematical meaning rather than copying raw elements (§15.2).
   */
  from(source: MatrixSource): Matrix4 {
    return isMatrixSourceArray(source) ? Matrix4.fromArray(source) : Matrix4.fromDOMMatrix(source);
  },

  /** The identity matrix. */
  identity(): Matrix4 {
    return Matrix4.identity();
  },

  /** Creates a `Matrix4` from a native or structural `DOMMatrix`. */
  fromDOMMatrix(other: DOMMatrixLike): Matrix4 {
    return Matrix4.fromDOMMatrix(other);
  },

  /** Composes position, rotation, and scale into the matrix `T × R × S`. */
  fromTRS(components: {
    position?: Vector3Like;
    rotation: Quaternion;
    scale?: Vector3Like;
  }): Matrix4 {
    return Matrix4.fromTRS(
      components.position ?? [0, 0, 0],
      components.rotation,
      components.scale ?? [1, 1, 1],
    );
  },

  /** The `DOMMatrix` constructor when the environment provides one. */
  get DOMMatrixConstructor(): (new () => DOMMatrixWritable) | undefined {
    return globalThis.DOMMatrix;
  },
} as const;

export { Matrix4 };
export type { TransformComponents } from "../transform/components.ts";
export type { DOMMatrixLike, DOMMatrixWritable, DOMPointInput, DOMPointOutput };
