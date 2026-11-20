---
title: Vector3
kind: class
longname: Vector3
description: An immutable 3D vector in the library's right-handed coordinate system (§4.4). All operations return new vectors; instances are never mutated (§4.2).
---

# Vector3

<SourceLink href="/keyframe-flow/docs/source/transform/vector3-ts/#L31" label="vector3.ts:31" />

An immutable 3D vector in the library's right-handed coordinate system (§4.4).

All operations return new vectors; instances are never mutated (§4.2).

**Example**

```ts
const v = new Vector3(1, 2, 3);
const unit = v.normalize(); // (0.267, 0.535, 0.802) — new vector, `v` intact
```

---

## Constructors

<MemberHeading id="constructor" depth="3" name="constructor" sig="new Vector3(x: number, y: number, z: number): Vector3" />

**Parameters**

- `x` (number, default: `0`)
- `y` (number, default: `0`)
- `z` (number, default: `0`)

**Returns**

`Vector3`

---

## Properties

<MemberHeading id="x" depth="3" name="x" sig="x: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L33" sourceLabel="vector3.ts:33" />

X coordinate.

<MemberHeading id="y" depth="3" name="y" sig="y: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L35" sourceLabel="vector3.ts:35" />

Y coordinate.

<MemberHeading id="z" depth="3" name="z" sig="z: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L37" sourceLabel="vector3.ts:37" />

Z coordinate.

## Methods

<MemberHeading id="add" depth="3" name="add" sig="add(other: Vector3Like): Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L60" sourceLabel="vector3.ts:60" />

Component-wise addition. Returns a new vector.

**Parameters**

- `other` ([Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)

<MemberHeading id="cross" depth="3" name="cross" sig="cross(other: Vector3Like): Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L81" sourceLabel="vector3.ts:81" />

Right-handed cross product `this × other`.

**Parameters**

- `other` ([Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)

<MemberHeading id="dot" depth="3" name="dot" sig="dot(other: Vector3Like): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L75" sourceLabel="vector3.ts:75" />

Dot product.

**Parameters**

- `other` ([Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- `number`

<MemberHeading id="equals" depth="3" name="equals" sig="equals(other: Vector3Like, epsilon: number): boolean" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L120" sourceLabel="vector3.ts:120" />

Element-wise comparison within `epsilon` (inclusive). Accepts any `Vector3Like`.

```ts
new Vector3(1, 2, 3).equals([1, 2, 3]); // true
```

**Parameters**

- `other` ([Vector3Like](/keyframe-flow/docs/vector3like))
- `epsilon` (number, default: `0`)

**Returns**

- `boolean`

<MemberHeading id="length" depth="3" name="length" sig="length(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L91" sourceLabel="vector3.ts:91" />

Euclidean length.

**Returns**

- `number`

<MemberHeading id="lengthsquared" depth="3" name="lengthSquared" sig="lengthSquared(): number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L96" sourceLabel="vector3.ts:96" />

Squared length (avoids a square root for comparisons).

**Returns**

- `number`

<MemberHeading id="normalize" depth="3" name="normalize" sig="normalize(): Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L105" sourceLabel="vector3.ts:105" />

Returns a unit-length copy pointing in the same direction. Throws on zero-length vectors rather than producing NaN (§9.2 spirit: never silently approximate).

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)

<MemberHeading id="scale" depth="3" name="scale" sig="scale(factor: number | Vector3Like): Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L66" sourceLabel="vector3.ts:66" />

Uniform scaling by a scalar, or per-axis scaling by a vector.

**Parameters**

- `factor` (number | [Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)

<MemberHeading id="toarray" depth="3" name="toArray" sig="toArray(): [number, number, number]" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L130" sourceLabel="vector3.ts:130" />

The `[x, y, z]` tuple form, for upload paths and destructuring.

**Returns**

- `[number, number, number]`

## Static Methods

<MemberHeading id="from" depth="3" name="from" sig="from(value: Vector3Like): Vector3" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L51" sourceLabel="vector3.ts:51" />

Coerces a tuple or `{x, y, z}` object into a `Vector3`.

**Parameters**

- `value` ([Vector3Like](/keyframe-flow/docs/vector3like))

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)

<MemberHeading id="zero" depth="3" name="zero" sig="zero(): Vector3" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/vector3-ts/#L46" sourceLabel="vector3.ts:46" />

The zero vector `(0, 0, 0)`.

**Returns**

- [`Vector3`](/keyframe-flow/docs/vector3)
