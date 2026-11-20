import type { Matrix4 } from "../matrix/matrix4.ts";
import type { RenderTarget } from "./types.ts";

/** Options for `webgl`. */
export interface WebGLRenderTargetOptions {
  /**
   * Upload hook invoked after every evaluation with the new column-major
   * matrix values — typically `gl.uniformMatrix4fv(location, false, values)`
   * plus a draw call. Returning here rather than owning a GL program keeps the
   * adapter free of shader and pipeline assumptions (§17.2).
   */
  readonly onTransform?: (matrix: Float32Array) => void;
}

/**
 * WebGL render target adapter (§3.6, §20 M5).
 *
 * @remarks
 * The adapter owns only rendering state: the latest evaluated transform as a
 * column-major `Float32Array` — the exact layout `gl.uniformMatrix4fv` and
 * GLSL `mat4` consume (§15) — plus an optional upload callback. It creates no
 * GL resources, never touches playback time or lifecycle (§3.6), and disposal
 * cannot destroy contexts, buffers, or programs (Appendix B.8). Hosts draw in
 * the `onTransform` hook or poll {@link WebGLRenderTarget.matrixValues} from
 * their own render loop.
 */
export class WebGLRenderTarget implements RenderTarget {
  private readonly _onTransform: ((matrix: Float32Array) => void) | undefined;
  private _values: Float32Array = new Float32Array([
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  ]);

  constructor(options: WebGLRenderTargetOptions = {}) {
    this._onTransform = options.onTransform;
  }

  /** A copy of the latest transform in column-major GL upload order (§15). */
  get matrixValues(): Float32Array {
    return new Float32Array(this._values);
  }

  /** Copies the latest values into `out` without allocating (performance, §2.9). */
  copyMatrixValuesTo(out: Float32Array): void {
    if (out.length < 16) {
      throw new RangeError("WebGLRenderTarget#copyMatrixValuesTo() requires at least 16 elements.");
    }
    out.set(this._values);
  }

  setTransform(matrix: Matrix4): void {
    this._values = matrix.toFloat32Array();
    this._onTransform?.(this._values);
  }
}

/**
 * Creates a `WebGLRenderTarget` (§3.6).
 * @example
 * ```ts
 * target.webgl({
 * onTransform: (values) => gl.uniformMatrix4fv(uModel, false, values),
 * });
 * ```
 */
export function webgl(options?: WebGLRenderTargetOptions): WebGLRenderTarget {
  return new WebGLRenderTarget(options);
}
