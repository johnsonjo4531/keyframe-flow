import { canvas } from "./canvas.ts";
import type { Canvas2DTargetOptions, CanvasRenderingContext2DLike } from "./canvas.ts";
import { html } from "./html.ts";
import type { CssTransformElementLike, HtmlTargetOptions } from "./html.ts";
import { svg } from "./svg.ts";
import type { SvgTransformElementLike } from "./svg.ts";
import { webgl } from "./webgl.ts";
import type { WebGLRenderTargetOptions } from "./webgl.ts";
import { webgpu } from "./webgpu.ts";
import type { WebGPURenderTargetOptions } from "./webgpu.ts";

/**
 * Built-in render target factories (§17).
 *
 * ```ts
 * spin.attach(target.html(element)).play();
 * spin.attach(target.svg(gElement)).play();
 * spin.attach(target.canvas(ctx2d)).play();
 * spin.attach(target.webgl({ onTransform: uploadAndDraw })).play();
 * ```
 *
 * Custom rendering systems skip this namespace entirely: any object with a
 * `setTransform(matrix)` method is a valid target (§17.1).
 */
export const target = {
  /** `html` — CSS `matrix3d()` transform adapter for HTML elements (§17). */
  html,
  /** `svg` — SVG 1.1 `matrix()` transform attribute adapter (§17). */
  svg,
  /** `canvas` — Canvas 2D CTM adapter with explicit projection (§17.3). */
  canvas,
  /** `webgl` — column-major matrix upload adapter for WebGL hosts (§3.6). */
  webgl,
  /** `webgpu` — column-major matrix upload adapter for WebGPU hosts (§3.6). */
  webgpu,
} as const;

export { html, matrixToCssTransform } from "./html.ts";
export { svg, matrixToSvgTransform } from "./svg.ts";
export { canvas, projectToCanvas2D } from "./canvas.ts";
export { webgl, WebGLRenderTarget } from "./webgl.ts";
export { webgpu, WebGPURenderTarget } from "./webgpu.ts";

export type { RenderTarget } from "./types.ts";
export type { CssTransformElementLike, HtmlTargetOptions };
export type { SvgTransformElementLike };
export type { CanvasRenderingContext2DLike, Canvas2DTargetOptions };
export type { WebGLRenderTargetOptions, WebGPURenderTargetOptions };
