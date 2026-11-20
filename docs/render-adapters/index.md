---
title: Render Adapters & Custom Targets
kind: guide
group: Guides
order: 5
---

# Render Adapters & Custom Targets

A render target is any object with a `setTransform(matrix)` method (§17.1). That's the entire contract — no base class, no imports from this library required inside your renderer:

```ts
import type { Matrix4, RenderTarget } from "keyframe-flow";

const logger: RenderTarget = {
  setTransform(matrix: Matrix4): void {
    console.log("position x =", matrix.el(12)); // column-major translation
  },
};

slide.attach(logger).play();
```

Adapters **own rendering state only** — they never touch playback time or lifecycle (§3.6), and disposing a playback never destroys the host's element, context, or GPU resources (Appendix B.8). An optional `dispose()` hook on the target lets adapters release whatever _they_ allocated; it runs at most once.

## HTML — `target.html(element)`

Writes CSS `matrix3d()` values in column-major argument order — no transposition, verified against the browser's own CSS parser:

```ts
const playback = slide.attach(target.html(box)); // owns style.transform
```

Because the adapter owns the inline transform property, any pre-existing `transform` is replaced on the first evaluated frame. A one-time origin can be set explicitly (§17.3):

```ts
target.html(box, { transformOrigin: "0 0" });
```

## SVG — `target.svg(element)`

Writes the SVG 1.1 `transform="matrix(a, b, c, d, e, f)"` attribute mapped from the matrix's column vectors. SVG is inherently 2D affine here: Z and perspective members are not expressible and are dropped by design (§17).

```ts
slide.attach(target.svg(document.querySelector("g")!));
```

## Canvas 2D — `target.canvas(context)`

A 4×4 matrix cannot be applied to a 2D context directly, so the adapter runs an explicit **projection step** rather than forwarding raw values (§17.3): the origin and X/Y basis images are projected through homogeneous perspective division with an optional camera distance, and the fitted affine is installed with `setTransform` — which replaces the CTM deterministically (it composes nothing).

```ts
const ctx = canvasElement.getContext("2d")!;

// Orthographic by default: pure 2D inputs reduce exactly to their affine part.
slide.attach(target.canvas(ctx));

// Objects pushed toward +z shrink away from a camera at distance 400.
slide.attach(target.canvas(ctx, { perspective: 400 }));
```

The projection is exposed as the pure function `projectToCanvas2D(matrix, options)` if you need it in your own draw code.

## WebGL — `target.webgl(options)`

GPU adapters own only rendering state: the latest evaluated transform as a column-major `Float32Array` — exactly what `gl.uniformMatrix4fv` and GLSL `mat4` consume (§15). No GL resources are created; you upload (and draw) in the hook or from your own loop:

```ts
slide.attach(
  target.webgl({
    onTransform: (values) => {
      gl.uniformMatrix4fv(uModelLocation, false, values);
      gl.drawArrays(gl.TRIANGLES, 0, vertexCount);
    },
  }),
);

// Or poll without a callback — `matrixValues` returns a copy, and
// `copyMatrixValuesTo(out)` fills an existing buffer without allocating.
```

## WebGPU — `target.webgpu(options)`

Identical shape to WebGL for WGSL hosts: the same column-major layout matches `mat4x4<f32>` uniforms element-for-element (§15). Device, queue, and command encoder ownership stay entirely host-side — encode your draw calls in `onTransform`.

```ts
slide.attach(
  target.webgpu({
    onTransform: (values) => {
      device.queue.writeBuffer(matrixUniforms, 0, values);
    },
  }),
);
```

## Ownership and disposal semantics (§17.2)

- The **most recently started** playback owns a target; starting another one supersedes the previous owner (replacement, never additive — §14).
- `playback.dispose()` runs the adapter's optional `dispose()` hook but leaves host objects fully intact: elements keep their last transform and remain writable, contexts stay usable, custom target data survives.
- Adapters are reusable after disposal — nothing GPU/DOM-side is destroyed by library code (Appendix B.8).

## See also

- API reference for the `RenderTarget` interface and adapter factories.
- Live HTML/SVG/Canvas/custom-target demos in the [Storybook examples](../../storybook/).
