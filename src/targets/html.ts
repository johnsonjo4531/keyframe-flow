import type { Matrix4 } from "../matrix/matrix4.ts";
import type { RenderTarget } from "./types.ts";

/**
 * The structural subset of an HTML element the adapter needs — any element
 * with a CSS `style.transform` string works, and no DOM lib types are
 * referenced so the core stays browser-API-free at import time (§2 principle 1).
 */
export interface CssTransformElementLike {
  /**
   * Inline style bag the adapter writes to. `transformOrigin` is optional —
   * only touched when explicitly requested (§17.3).
   */
  readonly style: {
    /** CSS `transform` property value; fully owned by the adapter (§17.3). */
    transform: string;
    /** CSS `transform-origin` property value, when supported (§17.3). */
    transformOrigin?: string;
  };
}

/** Options for `html`. */
export interface HtmlTargetOptions {
  /**
   * Optional `transform-origin` to apply once when the adapter is created.
   * When omitted the element keeps whatever origin CSS already gives it —
   * usually `50% 50%`. Because the library's matrices are origin-agnostic,
   * set an explicit origin (e.g. `"0 0"`) when matching other renderers.
   */
  readonly transformOrigin?: string;
}

/** Formats one number without losing precision to rounding. */
function formatNumber(value: number): string {
  return Object.is(value, -0) ? "0" : String(value);
}

/**
 * Converts a `Matrix4` to a CSS `matrix3d()` value (§17). CSS lists all
 * sixteen matrix elements in column-major order — exactly this library's
 * storage layout (§4.4) — so the values pass through in storage order without
 * transposition (§15.2).
 *
 * @example
 * ```ts
 * matrixToCssTransform(Matrix4.identity()); // "matrix3d(1, 0, 0, 0, 0, 1, …)"
 * ```
 */
export function matrixToCssTransform(matrix: Matrix4): string {
  return `matrix3d(${matrix.toArray().map(formatNumber).join(", ")})`;
}

/**
 * HTML render target adapter (§17): writes the evaluated transform to the
 * element's inline CSS `transform` as a `matrix3d()` value.
 *
 * Defined behavior (§17.3):
 * - **Transform origins:** matrices are origin-agnostic; the element's
 *   `transform-origin` applies as usual. Pass `transformOrigin` or set it in
 *   CSS for exact cross-renderer alignment.
 * - **Existing transforms:** the adapter owns the inline `transform` property
 *   and replaces it on every update; any pre-existing inline value is taken
 *   over (no composition — §14 has no implicit additive composition).
 * - **Units/precision:** unitless matrix distances map to CSS px; values are
 *   written at full number precision.
 * - **Invalidation/cleanup:** style writes invalidate layout automatically;
 *   the adapter owns no state to clean up and never removes or destroys the
 *   element (Appendix B.8).
 *
 * @example
 * ```ts
 * const playback = slide.attach(target.html(document.querySelector(".box")!));
 * playback.play();
 * ```
 */
export function html(element: CssTransformElementLike, options?: HtmlTargetOptions): RenderTarget {
  if (options?.transformOrigin !== undefined) {
    element.style.transformOrigin = options.transformOrigin;
  }
  return {
    setTransform(matrix: Matrix4): void {
      element.style.transform = matrixToCssTransform(matrix);
    },
  };
}
