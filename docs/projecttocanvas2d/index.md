---
title: projectToCanvas2D
kind: function
longname: projectToCanvas2D
description: "Projects a Matrix4 into Canvas 2D's affine form (§17.3). Canvas 2D is an inherently 2D affine API: the required projection step maps the transformed homogeneous images of the origin and the X/Y basis vectors through perspective division (and the optional camera at perspective distance), then fits the 2D affine that reproduces those screen positions. For purely affine inputs this reduces exactly to their 2D affine part; for matrices with Z or perspective components it produces the projected result rather than silently forwarding a raw 4×4 matrix, which Canvas cannot represent."
---

# projectToCanvas2D

<Signature
  code="projectToCanvas2D(
	matrix: Matrix4,
	options?: Canvas2DTargetOptions,
): readonly [number, number, number, number, number, number]"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/canvas-ts/#L66" label="canvas.ts:66" />

Projects a `Matrix4` into Canvas 2D's affine form (§17.3). Canvas 2D is an inherently 2D affine API: the required projection step maps the transformed homogeneous images of the origin and the X/Y basis vectors through perspective division (and the optional camera at `perspective` distance), then fits the 2D affine that reproduces those screen positions. For purely affine inputs this reduces exactly to their 2D affine part; for matrices with Z or perspective components it produces the projected result rather than silently forwarding a raw 4×4 matrix, which Canvas cannot represent.

**Parameters**

- `matrix` ([Matrix4](/keyframe-flow/docs/matrix4))
- `options` ([Canvas2DTargetOptions](/keyframe-flow/docs/canvas2dtargetoptions), optional)

**Returns**

- `readonly [number, number, number, number, number, number]`

**Example**

```ts
// +10 x at depth 50 with a camera at distance 100 projects to x = 20:
const [a, b, c, d, e, f] = projectToCanvas2D(m, { perspective: 100 });
ctx.setTransform(a, b, c, d, e, f); // e ≈ 20
```
