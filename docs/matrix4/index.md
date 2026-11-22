---
title: Matrix4
kind: class
longname: Matrix4
description: "The library's portable, canonical 4×4 matrix (§3.4, §15). Conventions (§4.4): right-handed coordinates, column vectors, column-major storage, radians for angular values. Element (row r, column c) lives at index c × 4 + r , so the translation components sit at indices 12, 13, 14 — matching WebGL/GLSL and DOMMatrix 's column-major array layout (§15.2). Instances are immutable; every operation returns a new matrix (§4.2)."
---

# Matrix4

<SourceLink href="/keyframe-flow/docs/source/matrix/matrix4-ts/#L32" label="matrix4.ts:32" />

The library's portable, canonical 4×4 matrix (§3.4, §15).

Conventions (§4.4): right-handed coordinates, column vectors, column-major storage, radians for angular values. Element `(row r, column c)` lives at index `c × 4 + r`, so the translation components sit at indices 12, 13, 14 — matching WebGL/GLSL and `DOMMatrix`'s column-major array layout (§15.2).

Instances are immutable; every operation returns a new matrix (§4.2).

**Example**

```ts
import { matrix, Quaternion } from "keyframe-flow";

const m = matrix.fromTRS({ position: [10, 0, 0], rotation: Quaternion.identity() });
m.el(12); // 10 — translation x at column-major index 12 (§15)
```

---

## Constructors

<MemberHeading id="constructor" depth="3" name="constructor" sig="new Matrix4(values?: ArrayLike<number>): Matrix4" />

**Parameters**

- `values` (ArrayLike\<number>, optional)

**Returns**

`Matrix4`

---

## Methods

<MemberHeading id="applytopoint" depth="3" name="applyToPoint" sig="applyToPoint(point: Vector3Like): Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L420" sourceLabel="matrix4.ts:420" />

Applies the matrix to a point (implicit w = 1).

**Parameters**

- `point` ([Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)

<MemberHeading id="applytovector" depth="3" name="applyToVector" sig="applyToVector(vector: Vector3Like): Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L430" sourceLabel="matrix4.ts:430" />

Applies the rotation/scale part to a direction vector (implicit w = 0).

**Parameters**

- `vector` ([Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)

<MemberHeading id="at" depth="3" name="at" sig="at(row: number, column: number): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L178" sourceLabel="matrix4.ts:178" />

Reads the element at `(row, column)`.

**Parameters**

- `row` (number)
- `column` (number)

**Returns**

- `number`

<MemberHeading id="decompose" depth="3" name="decompose" sig="decompose(): TransformComponents" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L342" sourceLabel="matrix4.ts:342" />

Extracts `{ position, rotation, scale }` from this matrix when it is mathematically decomposable into ordinary TRS components (§15.1).

Throws explicitly for matrices containing shear, reflection, perspective, or singular components instead of silently approximating them (§9.2).

**Returns**

- [`TransformComponents`](/keyframe-flow/docs/transformcomponents)

<MemberHeading id="el" depth="3" name="el" sig="el(index: number): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L189" sourceLabel="matrix4.ts:189" />

Reads the raw element at a column-major storage index (§15): `el(0..3)` is the first column, and `el(12)`, `el(13)`, `el(14)` are the translation x/y/z. This is the layout CSS `matrix3d()`, `gl.uniformMatrix4fv`, and `queue.writeBuffer` uploads expect; see also [Matrix4#at](/keyframe-flow/docs/matrix4#at) for `(row, column)` access.

**Parameters**

- `index` (number)

**Returns**

- `number`

<MemberHeading id="equals" depth="3" name="equals" sig="equals(other: Matrix4, epsilon: number): boolean" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L440" sourceLabel="matrix4.ts:440" />

Element-wise comparison within `epsilon`.

**Parameters**

- `other` ([Matrix4](/keyframe-flow/docs/matrix4))
- `epsilon` (number, default: `0`)

**Returns**

- `boolean`

<MemberHeading id="invert" depth="3" name="invert" sig="invert(): Matrix4" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L219" sourceLabel="matrix4.ts:219" />

Returns the inverse matrix. Throws when the matrix is singular, rather than producing approximate values (§9.2).

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)

<MemberHeading id="lerp" depth="3" name="lerp" sig="lerp(other: Matrix4, t: number): Matrix4" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L458" sourceLabel="matrix4.ts:458" />

Raw element-wise linear interpolation between two matrices — an explicit advanced escape hatch (§9.2), never the default transform interpolation. The result is generally not TRS-decomposable (interpolated rotations gain shear); decompose it only when the inputs justify it, and accept the explicit throw otherwise. See `Animation`'s `interpolation: "raw-matrix"` option for animation-level use.

**Parameters**

- `other` ([Matrix4](/keyframe-flow/docs/matrix4))
- `t` (number)

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)

<MemberHeading id="multiply" depth="3" name="multiply" sig="multiply(other: Matrix4): Matrix4" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L198" sourceLabel="matrix4.ts:198" />

Matrix product `this × other` in conventional mathematical notation with column vectors (§4.4): the composed transform applies `other` first, then `this`. Neither operand is modified.

**Parameters**

- `other` ([Matrix4](/keyframe-flow/docs/matrix4))

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)

<MemberHeading id="toarray" depth="3" name="toArray" sig="toArray(): number[]" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L87" sourceLabel="matrix4.ts:87" />

Returns a column-major number-array copy.

**Returns**

- `number[]`

<MemberHeading id="todommatrix" depth="3" name="toDOMMatrix" sig="toDOMMatrix(): DOMMatrixWritable" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L143" sourceLabel="matrix4.ts:143" />

Converts to a native `DOMMatrix`, preserving mathematical meaning: the returned matrix applies the same transform to column vectors.

Throws when the environment provides no `DOMMatrix` constructor — callers in browser-free environments should use `toFloat32Array()` or `toArray()`.

**Returns**

- [`DOMMatrixWritable`](/keyframe-flow/docs/dommatrixwritable)

<MemberHeading id="tofloat32array" depth="3" name="toFloat32Array" sig="toFloat32Array(): Float32Array" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L82" sourceLabel="matrix4.ts:82" />

Returns a column-major `Float32Array` copy (e.g. for GPU uploads).

**Returns**

- `Float32Array`

## Static Methods

<MemberHeading id="fromarray" depth="3" name="fromArray" sig="fromArray(values: ArrayLike<number>): Matrix4" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L68" sourceLabel="matrix4.ts:68" />

Creates a matrix from 16 values in column-major order.

**Parameters**

- `values` (ArrayLike\<number>)

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)

<MemberHeading id="fromdommatrix" depth="3" name="fromDOMMatrix" sig="fromDOMMatrix(other: DOMMatrixLike): Matrix4" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L104" sourceLabel="matrix4.ts:104" />

Creates a matrix from anything exposing the named `DOMMatrix` members `m11`–`m44`. Conversions go through named members rather than raw array copies so mathematical meaning survives storage-order differences (§15.2).

CSSOM names members as `m<column><row>` — the transpose of conventional mathematical `m<row><column>` naming. `DOMMatrix` transforms points as `x' = x·m11 + y·m21 + z·m31 + m41`, so member `mXY` corresponds to the element at math row `Y − 1`, column `X − 1`. Reading members in name order therefore yields exactly this library's column-major element order; "re-correcting" it would silently transpose the matrix.

**Parameters**

- `other` ([DOMMatrixLike](/keyframe-flow/docs/dommatrixlike))

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)

<MemberHeading id="fromfloat32array" depth="3" name="fromFloat32Array" sig="fromFloat32Array(values: Float32Array): Matrix4" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L77" sourceLabel="matrix4.ts:77" />

Creates a matrix from a `Float32Array` interpreted as column-major values. Precision may be reduced relative to the library's internal double precision; this is inherent to the source format (§15.2).

**Parameters**

- `values` (Float32Array)

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)

<MemberHeading
  id="fromtrs"
  depth="3"
  name="fromTRS"
  sig="fromTRS(
	position: Vector3Like,
	rotation: Quaternion,
	scale: Vector3Like,
): Matrix4"
/>

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L296" sourceLabel="matrix4.ts:296" />

Composes position, rotation, and scale into the canonical matrix `T × R × S` (§3.3): a point is scaled first, then rotated, then translated.

**Parameters**

- `position` ([Vector3Like](/keyframe-flow/docs/vector3like))
- `rotation` ([Quaternion](/keyframe-flow/docs/quaternion))
- `scale` ([Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)

**Example**

```ts
const m = Matrix4.fromTRS([10, 20, 0], Quaternion.identity(), [2, 2, 2]);
// Composes T × R × S — scale applies to the point first (§4.4).
```

<MemberHeading id="identity" depth="3" name="identity" sig="identity(): Matrix4" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/matrix/matrix4-ts/#L63" sourceLabel="matrix4.ts:63" />

The identity matrix — multiplying by it changes nothing.

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)
