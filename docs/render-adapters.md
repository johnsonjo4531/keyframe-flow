---
title: Render Adapters & Custom Targets
group: Guides
order: 5
---

# Render Adapters & Custom Targets

A render target is any object with a `setTransform(matrix)` method (§17.1).
That's the entire contract — no base class, no imports from this library
required inside your renderer:

```ts
import type { Matrix4, RenderTarget } from "keyframe-flow";

const logger: RenderTarget = {
  setTransform(matrix: Matrix4): void {
    console.log("position x =", matrix.el(12)); // column-major translation
  },
};

slide.attach(logger).play();
```

Adapters **own rendering state only** — they never touch playback time or
lifecycle (§3.6), and disposing a playback never destroys the host's element,
context, or GPU resources (Appendix B.8). An optional `dispose()` hook on the
target lets adapters release whatever _they_ allocated; it runs at most once.

The recorder below is a pure structural target — an object literal with just
`setTransform` — counting every matrix the engine submits:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=targets-custom-structural-target--matrix-recorder title="Live demo — custom structural target recording matrices" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/targets-custom-structural-target--matrix-recorder)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/targets-custom-structural-target--matrix-recorder)
for the target's source.

## HTML — `target.html(element)`

Writes CSS `matrix3d()` values in column-major argument order — no
transposition, verified against the browser's own CSS parser:

```ts
const playback = slide.attach(target.html(box)); // owns style.transform
```

Because the adapter owns the inline transform property, any pre-existing
`transform` is replaced on the first evaluated frame. A one-time origin can
be set explicitly (§17.3):

```ts
target.html(box, { transformOrigin: "0 0" });
```

The live demo shows the exact `matrix3d()` string written to the element's
`style.transform`, read back from the DOM:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=targets-html-adapter--matrix-3-d title="Live demo — HTML adapter writing matrix3d" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/targets-html-adapter--matrix-3-d)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/targets-html-adapter--matrix-3-d)
to switch the transform-origin.

## SVG — `target.svg(element)`

Writes the SVG 1.1 `transform="matrix(a, b, c, d, e, f)"` attribute mapped
from the matrix's column vectors. SVG is inherently 2D affine here: Z and
perspective members are not expressible and are dropped by design (§17).

```ts
slide.attach(target.svg(document.querySelector("g")!));
```

The live demo writes the SVG `transform="matrix(a, b, c, d, e, f)"` attribute and
shows it updating:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=targets-svg-adapter--matrix-attribute title="Live demo — SVG adapter writing the matrix attribute" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/targets-svg-adapter--matrix-attribute)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/targets-svg-adapter--matrix-attribute)
for the source.

## Canvas 2D — `target.canvas(context)`

A 4×4 matrix cannot be applied to a 2D context directly, so the adapter runs
an explicit **projection step** rather than forwarding raw values (§17.3):
the origin and X/Y basis images are projected through homogeneous perspective
division with an optional camera distance, and the fitted affine is installed
with `setTransform` — which replaces the CTM deterministically (it composes
nothing).

```ts
const ctx = canvasElement.getContext("2d")!;

// Orthographic by default: pure 2D inputs reduce exactly to their affine part.
slide.attach(target.canvas(ctx));

// Objects pushed toward +z shrink away from a camera at distance 400.
slide.attach(target.canvas(ctx, { perspective: 400 }));
```

The projection is exposed as the pure function `projectToCanvas2D(matrix, options)`
if you need it in your own draw code.

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=targets-canvas-2d-adapter--projected-motion title="Live demo — Canvas 2D adapter with projected CTM" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/targets-canvas-2d-adapter--projected-motion)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/targets-canvas-2d-adapter--projected-motion)
to read the fitted `e`/`f` translation live.

## WebGL — `target.webgl(options)`

GPU adapters own only rendering state: the latest evaluated transform as a
column-major `Float32Array` — exactly what `gl.uniformMatrix4fv` and GLSL
`mat4` consume (§15). No GL resources are created; you upload (and draw) in
the hook or from your own loop:

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

The story owns the GL context and draw loop; the adapter just keeps the
`uModel` uniform fresh each frame — watch the quad transform:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=targets-webgl-adapter--uniform-upload title="Live demo — WebGL adapter uploading a mat4 uniform" height=520 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/targets-webgl-adapter--uniform-upload)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/targets-webgl-adapter--uniform-upload)
for the shader and draw code.

## WebGPU — `target.webgpu(options)`

Identical shape to WebGL for WGSL hosts: the same column-major layout matches
`mat4x4<f32>` uniforms element-for-element (§15). Device, queue, and command
encoder ownership stay entirely host-side — encode your draw calls in
`onTransform`.

```ts
slide.attach(
  target.webgpu({
    onTransform: (values) => {
      device.queue.writeBuffer(matrixUniforms, 0, values);
    },
  }),
);
```

This story stays device-free — it shows exactly the column-major values a
`queue.writeBuffer` call would receive each frame:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=targets-webgpu-adapter--uniform-write title="Live demo — WebGPU adapter uniform buffer write values" height=470 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/targets-webgpu-adapter--uniform-write)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/targets-webgpu-adapter--uniform-write)
for the source.

## Ownership and disposal semantics (§17.2)

- The **most recently started** playback owns a target; starting another one
  supersedes the previous owner (replacement, never additive — §14).
- `playback.dispose()` runs the adapter's optional `dispose()` hook but leaves
  host objects fully intact: elements keep their last transform and remain
  writable, contexts stay usable, custom target data survives.
- Adapters are reusable after disposal — nothing GPU/DOM-side is destroyed by
  library code (Appendix B.8).

## See also

- API reference for the `RenderTarget` interface and adapter factories.
- Live HTML/SVG/Canvas/custom-target demos in the
  [Storybook examples](../../storybook/).
