import type { Matrix4 } from "../matrix/matrix4.ts";
import type { RenderTarget } from "./types.ts";

/**
 * The structural subset of a Canvas 2D context the adapter needs — only
 * `setTransform` is required, so mocks and offscreen contexts work too. No DOM
 * lib types are referenced (§2 principle 1).
 */
export interface CanvasRenderingContext2DLike {
  /** Replaces the context's current transform matrix (CTM) — never composes (§17.3). */
  setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
}

/** Options for `canvas`. */
export interface Canvas2DTargetOptions {
  /**
   * Camera distance in user-space units for the perspective projection step.
   * Omit (or `Infinity`) for orthographic projection, which keeps parallel
   * lines parallel and is the right default for most 2D scenes (§17.3).
   */
  readonly perspective?: number;
}

/** Homogeneous image of a point under the matrix. */
function transformHomogeneous(
  matrix: Matrix4,
  x: number,
  y: number,
  z: number,
): [number, number, number, number] {
  return [
    matrix.at(0, 0) * x + matrix.at(0, 1) * y + matrix.at(0, 2) * z + matrix.at(0, 3),
    matrix.at(1, 0) * x + matrix.at(1, 1) * y + matrix.at(1, 2) * z + matrix.at(1, 3),
    matrix.at(2, 0) * x + matrix.at(2, 1) * y + matrix.at(2, 2) * z + matrix.at(2, 3),
    matrix.at(3, 0) * x + matrix.at(3, 1) * y + matrix.at(3, 2) * z + matrix.at(3, 3),
  ];
}

/** Guards the perspective divisor against division by (near-)zero. */
const DIVERGENCE_EPSILON = 1e-9;

function safeDivisor(w: number): number {
  if (Math.abs(w) < DIVERGENCE_EPSILON) {
    return w < 0 ? -DIVERGENCE_EPSILON : DIVERGENCE_EPSILON;
  }
  return w;
}

/**
 * Projects a `Matrix4` into Canvas 2D's affine form (§17.3). Canvas 2D is an
 * inherently 2D affine API: the required projection step maps the transformed
 * homogeneous images of the origin and the X/Y basis vectors through
 * perspective division (and the optional camera at `perspective` distance),
 * then fits the 2D affine that reproduces those screen positions. For purely
 * affine inputs this reduces exactly to their 2D affine part; for matrices
 * with Z or perspective components it produces the projected result rather
 * than silently forwarding a raw 4×4 matrix, which Canvas cannot represent.
 *
 * @example
 * ```ts
 * // +10 x at depth 50 with a camera at distance 100 projects to x = 20:
 * const [a, b, c, d, e, f] = projectToCanvas2D(m, { perspective: 100 });
 * ctx.setTransform(a, b, c, d, e, f); // e ≈ 20
 * ```
 */
export function projectToCanvas2D(
  matrix: Matrix4,
  options?: Canvas2DTargetOptions,
): readonly [number, number, number, number, number, number] {
  const distance = options?.perspective;
  const useCamera = distance !== undefined && Number.isFinite(distance) && distance !== 0;

  // Homogeneous images of the origin and X/Y basis vectors, then project.
  const points: Array<[number, number]> = [];
  for (const [x, y, z] of [
    [0, 0, 0],
    [1, 0, 0],
    [0, 1, 0],
  ] as const) {
    let [px, py, pz, pw] = transformHomogeneous(matrix, x, y, z);
    if (useCamera) {
      // Camera perspective: scale shrinks with depth, like CSS `perspective`.
      pw -= pz / (distance as number);
    }
    const divisor = safeDivisor(pw);
    points.push([px / divisor, py / divisor]);
  }

  const [origin, xAxis, yAxis] = points as [[number, number], [number, number], [number, number]];
  return [
    xAxis[0] - origin[0], // a
    xAxis[1] - origin[1], // b
    yAxis[0] - origin[0], // c
    yAxis[1] - origin[1], // d
    origin[0], // e
    origin[1], // f
  ];
}

/**
 * Canvas 2D render target adapter (§17): projects the evaluated transform
 * through `projectToCanvas2D` and applies it with `setTransform`.
 * Defined behavior (§17.3):
 * - **Projection:** 3D transforms are projected to the canvas's affine space;
 * raw 4×4 matrices are never forwarded, since Canvas cannot apply them.
 * - **Existing transforms:** `setTransform` replaces the context's current
 * transformation matrix (the adapter owns it); compose with scene camera
 * transforms yourself if needed — this keeps frames deterministic.
 * - **Invalidation:** drawing is host-driven; the adapter updates the CTM,
 * and hosts redraw between frames. No explicit invalidation exists for
 * canvases.
 * - **Cleanup:** the context is not owned — disposing playback never resets
 * or destroys it (Appendix B.8). Clear the canvas yourself when done.
 * @example
 * ```ts
 * const ctx = canvasElement.getContext("2d")!;
 * slide.attach(target.canvas(ctx, { perspective: 400 })).play();
 * ```
 */
export function canvas(
  context: CanvasRenderingContext2DLike,
  options?: Canvas2DTargetOptions,
): RenderTarget {
  return {
    setTransform(matrix: Matrix4): void {
      const [a, b, c, d, e, f] = projectToCanvas2D(matrix, options);
      context.setTransform(a, b, c, d, e, f);
    },
  };
}
