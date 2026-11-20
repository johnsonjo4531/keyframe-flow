import type { Matrix4 } from "../matrix/matrix4.ts";
import type { RenderTarget } from "./types.ts";

/** Options for `webgpu`. */
export interface WebGPURenderTargetOptions {
  /**
   * Upload hook invoked after every evaluation with the new column-major
   * matrix values — copy them into your uniform buffer (WGSL `mat4x4<f32>`
   * uses the same column-major layout, §15) and encode draw calls. Keeping
   * command encoding host-side leaves device, queue, and pipeline ownership
   * with the host (§17.2).
   */
  readonly onTransform?: (matrix: Float32Array) => void;
}

/**
 * WebGPU render target adapter (§3.6, §20 M5).
 *
 * @remarks
 * The adapter owns only rendering state: the latest evaluated transform as a
 * column-major `Float32Array`, matching WGSL's `mat4x4<f32>` uniform layout
 * element-for-element (§15). It creates no GPU resources, never touches
 * playback time or lifecycle (§3.6), and disposal cannot destroy devices,
 * buffers, or encoders (Appendix B.8) — hosts encode work in the
 * `onTransform` hook or read {@link WebGPURenderTarget.matrixValues} from
 * their own frame loop.
 */
export class WebGPURenderTarget implements RenderTarget {
  private readonly _onTransform: ((matrix: Float32Array) => void) | undefined;
  private _values: Float32Array = new Float32Array([
    1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1,
  ]);

  constructor(options: WebGPURenderTargetOptions = {}) {
    this._onTransform = options.onTransform;
  }

  /** A copy of the latest transform in column-major WGSL uniform layout (§15). */
  get matrixValues(): Float32Array {
    return new Float32Array(this._values);
  }

  /** Copies the latest values into `out` without allocating (performance, §2.9). */
  copyMatrixValuesTo(out: Float32Array): void {
    if (out.length < 16) {
      throw new RangeError(
        "WebGPURenderTarget#copyMatrixValuesTo() requires at least 16 elements.",
      );
    }
    out.set(this._values);
  }

  setTransform(matrix: Matrix4): void {
    this._values = matrix.toFloat32Array();
    this._onTransform?.(this._values);
  }
}

/**
 * Creates a `WebGPURenderTarget` (§3.6).
 * @example
 * ```ts
 * target.webgpu({
 * onTransform: (values) => device.queue.writeBuffer(uniforms, 0, values),
 * });
 * ```
 */
export function webgpu(options?: WebGPURenderTargetOptions): WebGPURenderTarget {
  return new WebGPURenderTarget(options);
}
