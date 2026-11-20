---
title: matrixToCssTransform
kind: function
longname: matrixToCssTransform
description: Converts a Matrix4 to a CSS matrix3d() value (§17). CSS lists all sixteen matrix elements in column-major order — exactly this library's storage layout (§4.4) — so the values pass through in storage order without transposition (§15.2).
---

# matrixToCssTransform

<Signature code="matrixToCssTransform(matrix: Matrix4): string" />

<SourceLink href="/keyframe-flow/docs/source/targets/html-ts/#L49" label="html.ts:49" />

Converts a `Matrix4` to a CSS `matrix3d()` value (§17). CSS lists all sixteen matrix elements in column-major order — exactly this library's storage layout (§4.4) — so the values pass through in storage order without transposition (§15.2).

**Parameters**

- `matrix` ([Matrix4](/keyframe-flow/docs/matrix4))

**Returns**

- `string`

**Example**

```ts
matrixToCssTransform(Matrix4.identity()); // "matrix3d(1, 0, 0, 0, 0, 1, …)"
```
