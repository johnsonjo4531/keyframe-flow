import type { Matrix4 } from "../matrix/matrix4.ts";

/**
 * The structural render target interface (§17.1). Any object with a
 * `setTransform` method is a valid target — custom rendering systems do not
 * need to inherit from a library class or import anything from it.
 *
 * The engine owns playback state; the target owns rendering-specific state
 * only (§17.2). Adapters translate evaluated transforms into
 * rendering-system-specific operations and never own animation time or
 * playback lifecycle (§3.6). Disposing a playback must not destroy the
 * underlying DOM element, canvas context, or graphics resource — targets are
 * not owned resources (Appendix B.8) — so `dispose` is optional and reserved
 * for adapter-owned bookkeeping only.
 *
 * @example
 * ```ts
 * const recorder: RenderTarget = {
 *   matrices: [] as Matrix4[],
 *   setTransform(matrix: Matrix4) {
 *     this.matrices.push(matrix);
 *   },
 * };
 * animation.attach(recorder).play();
 * ```
 */
export interface RenderTarget {
  /** Receives the evaluated transform as a canonical `Matrix4` (§17.1). */
  setTransform(matrix: Matrix4): void;
  /** Optional cleanup of adapter-owned state; never destroys host resources. */
  dispose?(): void;
}
