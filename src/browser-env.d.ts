/**
 * Minimal structural declarations for the browser APIs used by adapter
 * browser tests. Like `./types.d.ts`, the full DOM lib is not loaded
 * (§2 principle 1); only the members exercised by `*.browser.test.ts` files
 * are declared, structurally satisfied by the real objects at runtime.
 *
 */

import type { CanvasRenderingContext2DLike } from "./targets/canvas.ts";
import type { CssTransformElementLike } from "./targets/html.ts";
import type { SvgTransformElementLike } from "./targets/svg.ts";
import type { DOMMatrixWritable } from "./types.d.ts";

/** A real HTML element as far as the html adapter and its tests care. */
export interface BrowserHtmlElement extends CssTransformElementLike {}

/** A real SVG element as far as the svg adapter and its tests care. */
export interface BrowserSvgElement extends SvgTransformElementLike {
  getAttribute(name: string): string | null;
}

/** A real Canvas 2D context with the introspection members tests need. */
export interface BrowserCanvasContext extends CanvasRenderingContext2DLike {
  getTransform(): DOMMatrixWritable;
  fillRect(x: number, y: number, width: number, height: number): void;
}

/** A real canvas element as far as the canvas adapter and its tests care. */
export interface BrowserCanvasElement extends CssTransformElementLike {
  getContext(contextId: "2d"): BrowserCanvasContext | null;
  /** The WebGL context's surface is exercised through a locally declared structural type. */
  getContext(contextId: "webgl"): unknown;
}

interface BrowserDocument {
  createElement(tagName: "canvas"): BrowserCanvasElement;
  createElement(tagName: string): BrowserHtmlElement;
  createElementNS(namespace: string, tagName: string): BrowserSvgElement;
}

declare global {
  /** Present only in browser test environments. */
  var document: BrowserDocument | undefined;
}

export {};
