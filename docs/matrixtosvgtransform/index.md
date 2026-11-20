---
title: matrixToSvgTransform
kind: function
longname: matrixToSvgTransform
description: "Converts a Matrix4 to an SVG 1.1 matrix(a, b, c, d, e, f) transform value (§17). SVG's 2D affine form maps to the matrix's column vectors as a = col₀.x, b = col₀.y, c = col₁.x, d = col₁.y, e = tx, f = ty . Values are comma-separated so the same string is also valid CSS transform syntax. SVG 1.1 transform attributes are inherently 2D: Z-axis and perspective components cannot be expressed and are not applied by renderers — compose 2D transforms or flatten deliberately when targeting SVG (§17.3)."
---

# matrixToSvgTransform

<Signature code="matrixToSvgTransform(matrix: Matrix4): string" />

<SourceLink href="/keyframe-flow/docs/source/targets/svg-ts/#L33" label="svg.ts:33" />

Converts a `Matrix4` to an SVG 1.1 `matrix(a, b, c, d, e, f)` transform value (§17). SVG's 2D affine form maps to the matrix's column vectors as `a = col₀.x, b = col₀.y, c = col₁.x, d = col₁.y, e = tx, f = ty`. Values are comma-separated so the same string is also valid CSS transform syntax.

SVG 1.1 transform attributes are inherently 2D: Z-axis and perspective components cannot be expressed and are not applied by renderers — compose 2D transforms or flatten deliberately when targeting SVG (§17.3).

**Parameters**

- `matrix` ([Matrix4](/keyframe-flow/docs/matrix4))

**Returns**

- `string`

**Example**

```ts
matrixToSvgTransform(Matrix4.identity()); // "matrix(1, 0, 0, 1, 0, 0)"
```
