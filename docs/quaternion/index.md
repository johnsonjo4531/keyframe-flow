---
title: Quaternion
kind: class
longname: Quaternion
description: "An immutable unit-friendly quaternion used as the library's internal rotation representation (§4.3). Components follow the Hamilton convention (x, y, z, w) with w as the scalar part. Multiplication follows matrix conventions for column vectors: a.multiply(b) produces the rotation that applies b first and then a , mirroring A × B in §4.4."
---

# Quaternion

<SourceLink href="/keyframe-flow/docs/source/transform/quaternion-ts/#L37" label="quaternion.ts:37" />

An immutable unit-friendly quaternion used as the library's internal rotation representation (§4.3). Components follow the Hamilton convention `(x, y, z, w)` with `w` as the scalar part.

Multiplication follows matrix conventions for column vectors: `a.multiply(b)` produces the rotation that applies `b` first and then `a`, mirroring `A × B` in §4.4.

**Example**

```ts
const turn = Quaternion.fromEuler(0, Math.PI / 2, 0); // yaw 90°, radians only
turn.rotateVector([1, 0, 0]); // Vector3 ≈ (0, 0, −1) — right-handed
```

---

## Constructors

<MemberHeading
  id="constructor"
  depth="3"
  name="constructor"
  sig="new Quaternion(
	x: number,
	y: number,
	z: number,
	w: number,
): Quaternion"
/>

**Parameters**

- `x` (number, default: `0`)
- `y` (number, default: `0`)
- `z` (number, default: `0`)
- `w` (number, default: `1`)

**Returns**

`Quaternion`

---

## Properties

<MemberHeading id="w" depth="3" name="w" sig="w: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L45" sourceLabel="quaternion.ts:45" />

Scalar part.

<MemberHeading id="x" depth="3" name="x" sig="x: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L39" sourceLabel="quaternion.ts:39" />

Vector part X.

<MemberHeading id="y" depth="3" name="y" sig="y: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L41" sourceLabel="quaternion.ts:41" />

Vector part Y.

<MemberHeading id="z" depth="3" name="z" sig="z: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L43" sourceLabel="quaternion.ts:43" />

Vector part Z.

## Methods

<MemberHeading id="multiplyraw" depth="3" name="_multiplyRaw" sig="_multiplyRaw(q: Quaternion): Quaternion" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L100" sourceLabel="quaternion.ts:100" />

Internal non-coercing product; never exposed so inputs stay immutable.

**Parameters**

- `q` ([Quaternion](/keyframe-flow/docs/quaternion))

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)

<MemberHeading id="conjugate" depth="3" name="conjugate" sig="conjugate(): Quaternion" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L124" sourceLabel="quaternion.ts:124" />

The conjugate; for unit quaternions this is also the inverse.

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)

<MemberHeading id="dot" depth="3" name="dot" sig="dot(other: QuaternionObject): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L129" sourceLabel="quaternion.ts:129" />

Dot product of the four components (cosine between unit orientations).

**Parameters**

- `other` ([QuaternionObject](/keyframe-flow/docs/quaternionobject))

**Returns**

- `number`

<MemberHeading id="equals" depth="3" name="equals" sig="equals(other: QuaternionObject, epsilon: number): boolean" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L203" sourceLabel="quaternion.ts:203" />

Component-wise comparison within `epsilon` (inclusive). Note `q` and `-q` describe the same orientation but do not compare equal here — use `Quaternion#dot` (`|dot| ≈ 1`) for orientation equality.

**Parameters**

- `other` ([QuaternionObject](/keyframe-flow/docs/quaternionobject))
- `epsilon` (number, default: `0`)

**Returns**

- `boolean`

<MemberHeading id="length" depth="3" name="length" sig="length(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L110" sourceLabel="quaternion.ts:110" />

Euclidean norm of the four components.

**Returns**

- `number`

<MemberHeading id="multiply" depth="3" name="multiply" sig="multiply(other: QuaternionObject): Quaternion" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L94" sourceLabel="quaternion.ts:94" />

Hamilton product `this ⊗ other` — the rotation that applies `other` first, then `this`. Returns a new quaternion.

**Parameters**

- `other` ([QuaternionObject](/keyframe-flow/docs/quaternionobject))

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)

<MemberHeading id="normalize" depth="3" name="normalize" sig="normalize(): Quaternion" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L115" sourceLabel="quaternion.ts:115" />

Returns a unit-length copy. Throws on zero-length quaternions.

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)

<MemberHeading id="rotatevector" depth="3" name="rotateVector" sig="rotateVector(v: Vector3Like): Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L184" sourceLabel="quaternion.ts:184" />

Rotates a vector by this quaternion: `v' = q · v · q*`.

**Parameters**

- `v` ([Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)

<MemberHeading id="slerp" depth="3" name="slerp" sig="slerp(other: QuaternionObject, t: number): Quaternion" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L140" sourceLabel="quaternion.ts:140" />

Spherical linear interpolation toward `other` at parameter `t ∈ [0, 1]`.

Inputs are normalized before use and the shortest path on the 4D sphere is taken by default (§9.1). Endpoints reproduce the inputs exactly.

**Parameters**

- `other` ([QuaternionObject](/keyframe-flow/docs/quaternionobject))
- `t` (number)

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)

<MemberHeading id="toarray" depth="3" name="toArray" sig="toArray(): [number, number, number, number]" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L251" sourceLabel="quaternion.ts:251" />

The `[x, y, z, w]` tuple form (Hamilton order).

**Returns**

- `[number, number, number, number]`

<MemberHeading id="toeuler" depth="3" name="toEuler" sig="toEuler(): readonly [number, number, number]" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L226" sourceLabel="quaternion.ts:226" />

Decomposes this rotation into Euler angles in radians, in the inverse of `Quaternion.fromEuler`'s intrinsic X → Y → Z convention (the angles whose `Rx · Ry · Rz` matrix reproduces this orientation). Angles are chosen by principal-value `asin`/`atan2`, so results need not match any particular authored triple numerically — only the resulting orientation. At the gimbal-lock poses (Y at ±90°) the X and Z angles are ambiguous; this decomposition resolves them by convention with Z set to zero. Used by angular rotation tracks (§9.1) when authored angles are not available.

**Returns**

- `readonly [number, number, number]`

## Static Methods

<MemberHeading id="from" depth="3" name="from" sig="from(value: QuaternionObject): Quaternion" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L85" sourceLabel="quaternion.ts:85" />

Coerces a `{x, y, z, w}` object into a `Quaternion`.

**Parameters**

- `value` ([QuaternionObject](/keyframe-flow/docs/quaternionobject))

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)

<MemberHeading id="fromaxisangle" depth="3" name="fromAxisAngle" sig="fromAxisAngle(axis: Vector3Like, angle: number): Quaternion" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L77" sourceLabel="quaternion.ts:77" />

Creates a quaternion for a rotation of `angle` radians about `axis` using the right-hand rule (§4.4). The axis is normalized first.

**Parameters**

- `axis` ([Vector3Like](/keyframe-flow/docs/vector3like))
- `angle` (number)

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)

<MemberHeading id="fromeuler" depth="3" name="fromEuler" sig="fromEuler(x: number, y: number, z: number): Quaternion" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L66" sourceLabel="quaternion.ts:66" />

Creates a quaternion from Euler angles in radians (§4.3).

Angles are applied as intrinsic rotations in X → Y → Z order (each about the frame produced by the previous rotation), which is equivalent to the matrix product `Rx · Ry · Rz` acting on column vectors.

**Parameters**

- `x` (number)
- `y` (number)
- `z` (number)

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)

<MemberHeading id="identity" depth="3" name="identity" sig="identity(): Quaternion" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/quaternion-ts/#L55" sourceLabel="quaternion.ts:55" />

The identity rotation `(0, 0, 0, 1)` — no rotation at all.

**Returns**

- [`Quaternion`](/keyframe-flow/docs/quaternion)
