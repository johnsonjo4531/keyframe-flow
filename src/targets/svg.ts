import type { Matrix4 } from "../matrix/matrix4.ts";
import type { RenderTarget } from "./types.ts";

/**
 * The structural subset of an SVG element the adapter needs — anything with
 * `setAttribute` works (SVG 1.1 transform attributes), no DOM lib types.
 */
export interface SvgTransformElementLike {
  /** Sets an attribute — used for the SVG 1.1 `transform` attribute (§17). */
  setAttribute(name: string, value: string): void;
}

/** Formats one number without losing precision to rounding. */
function formatNumber(value: number): string {
  return Object.is(value, -0) ? "0" : String(value);
}

/**
 * Converts a `Matrix4` to an SVG 1.1 `matrix(a, b, c, d, e, f)` transform
 * value (§17). SVG's 2D affine form maps to the matrix's column vectors as
 * `a = col₀.x, b = col₀.y, c = col₁.x, d = col₁.y, e = tx, f = ty`. Values
 * are comma-separated so the same string is also valid CSS transform syntax.
 *
 * SVG 1.1 transform attributes are inherently 2D: Z-axis and perspective
 * components cannot be expressed and are not applied by renderers — compose
 * 2D transforms or flatten deliberately when targeting SVG (§17.3).
 *
 * @example
 * ```ts
 * matrixToSvgTransform(Matrix4.identity()); // "matrix(1, 0, 0, 1, 0, 0)"
 * ```
 */
export function matrixToSvgTransform(matrix: Matrix4): string {
  const a = matrix.at(0, 0);
  const b = matrix.at(1, 0);
  const c = matrix.at(0, 1);
  const d = matrix.at(1, 1);
  const e = matrix.at(0, 3);
  const f = matrix.at(1, 3);
  return `matrix(${[a, b, c, d, e, f].map(formatNumber).join(", ")})`;
}

/**
 * SVG render target adapter (§17): writes the evaluated transform to the
 * element's `transform` attribute as an SVG 1.1 `matrix()` value.
 *
 * Defined behavior (§17.3): the adapter owns the `transform` attribute and
 * replaces it on every update; coordinates are the element's local user
 * space (origin governed by the viewport/`transform-box`, not the adapter);
 * values are written at full number precision; the adapter never removes or
 * destroys the element (Appendix B.8).
 *
 * @example
 * ```ts
 * slide.attach(target.svg(document.querySelector("g")!)).play();
 * // writes transform="matrix(a, b, c, d, e, f)" on each frame (§17)
 * ```
 */
export function svg(element: SvgTransformElementLike): RenderTarget {
  return {
    setTransform(matrix: Matrix4): void {
      element.setAttribute("transform", matrixToSvgTransform(matrix));
    },
  };
}
