---
title: Transform
kind: class
longname: Transform
description: "An immutable transform with the canonical component representation { position, rotation: Quaternion, scale } (§4.3), available as the frozen components property. Euler angles are accepted only as a construction interface in radians; rotations are stored internally as quaternions (§4.3). Every operation returns a new transform without modifying its source (§4.2). Composition follows §4.4 exactly: fluent operations are applied in call order as local-space operations (right-multiplication, M ← M × Op ), and parent-to-child composition uses Parent × Local . When a composed result cannot be represented as ordinary TRS components — for example rotation appended after non-uniform scale, which introduces shear — the operation throws explicitly rather than silently approximating (§4.3, §9.2). Use Matrix4 directly for such matrices."
---

# Transform

<SourceLink href="/keyframe-flow/docs/source/transform/transform-ts/#L53" label="transform.ts:53" />

An immutable transform with the canonical component representation `{ position, rotation: Quaternion, scale }` (§4.3), available as the frozen `components` property.

Euler angles are accepted only as a construction interface in radians; rotations are stored internally as quaternions (§4.3). Every operation returns a new transform without modifying its source (§4.2).

Composition follows §4.4 exactly: fluent operations are applied in call order as local-space operations (right-multiplication, `M ← M × Op`), and parent-to-child composition uses `Parent × Local`. When a composed result cannot be represented as ordinary TRS components — for example rotation appended after non-uniform scale, which introduces shear — the operation throws explicitly rather than silently approximating (§4.3, §9.2). Use `Matrix4` directly for such matrices.

---

## Constructors

<MemberHeading id="constructor" depth="3" name="constructor" sig="new Transform(components: TransformComponentsInit): Transform" />

**Parameters**

- `components` ([TransformComponentsInit](/keyframe-flow/docs/transformcomponentsinit), default: `{}`)

**Returns**

`Transform`

---

## Properties

<MemberHeading id="components" depth="3" name="components" sig="components: Readonly<TransformComponents>" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L55" sourceLabel="transform.ts:55" />

Canonical position/rotation/scale components; frozen and never mutated.

## Methods

<MemberHeading id="compose" depth="3" name="compose" sig="compose(local: Transform): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L118" sourceLabel="transform.ts:118" />

Composes `parent × local` into a new transform (§4.4). The local transform is interpreted in the parent's coordinate system. Throws when the composed matrix is not representable as TRS components.

**Parameters**

- `local` ([Transform](/keyframe-flow/docs/transform))

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

**Example**

```ts
const arm = transform().translate(100, 0); // parent
const item = transform().rotateZ(Math.PI / 2); // child in parent frame
const world = arm.compose(item); // Parent × Local (§4.4)
```

<MemberHeading id="equals" depth="3" name="equals" sig="equals(other: Transform, epsilon: number): boolean" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L240" sourceLabel="transform.ts:240" />

Structural equality; rotations compare without quaternion sign ambiguity.

**Parameters**

- `other` ([Transform](/keyframe-flow/docs/transform))
- `epsilon` (number, default: `EQUALS_EPSILON`)

**Returns**

- `boolean`

<MemberHeading id="rotate" depth="3" name="rotate" sig="rotate(rotation: QuaternionObject): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L178" sourceLabel="transform.ts:178" />

Appends a rotation in the object's local frame: `M ← M × R(q)`. Throws when the result is not representable as TRS (non-uniform scale followed by rotation produces shear, §9.2).

**Parameters**

- `rotation` ([QuaternionObject](/keyframe-flow/docs/quaternionobject))

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="rotatex" depth="3" name="rotateX" sig="rotateX(angle: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L159" sourceLabel="transform.ts:159" />

Rotates by `angle` radians about the local X axis (right-hand rule).

**Parameters**

- `angle` (number)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="rotatey" depth="3" name="rotateY" sig="rotateY(angle: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L164" sourceLabel="transform.ts:164" />

Rotates by `angle` radians about the local Y axis (right-hand rule).

**Parameters**

- `angle` (number)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="rotatez" depth="3" name="rotateZ" sig="rotateZ(angle: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L169" sourceLabel="transform.ts:169" />

Rotates by `angle` radians about the local Z axis (right-hand rule).

**Parameters**

- `angle` (number)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="scale" depth="3" name="scale" sig="scale(x: number, y: number, z: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L188" sourceLabel="transform.ts:188" />

Scales by `(x, y, z)` along the object's local axes; a single argument scales uniformly. Equivalent to `M ← M × S` (exact: diagonal scales compose component-wise).

**Parameters**

- `x` (number)
- `y` (number, default: `x`)
- `z` (number, default: `x`)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="tomatrix" depth="3" name="toMatrix" sig="toMatrix(): Matrix4" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L92" sourceLabel="transform.ts:92" />

The matrix `T × R × S` for these components.

**Returns**

- [`Matrix4`](/keyframe-flow/docs/matrix4)

<MemberHeading id="translate" depth="3" name="translate" sig="translate(x: number, y: number, z: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L148" sourceLabel="transform.ts:148" />

Translates by `(x, y, z)` along the object's local axes. Omitted components default to zero. Equivalent to `M ← M × T`.

**Parameters**

- `x` (number)
- `y` (number, default: `0`)
- `z` (number, default: `0`)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

**Example**

```ts
const t = transform().translate(10, 20); // position (10, 20, 0)
t.components.position.y; // 20 — the source is never mutated (§4.2)
```

<MemberHeading id="worldrotate" depth="3" name="worldRotate" sig="worldRotate(rotation: QuaternionObject): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L229" sourceLabel="transform.ts:229" />

Rotates in the parent coordinate system: `M ← R(q) × M` (exact).

**Parameters**

- `rotation` ([QuaternionObject](/keyframe-flow/docs/quaternionobject))

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="worldrotatex" depth="3" name="worldRotateX" sig="worldRotateX(angle: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L214" sourceLabel="transform.ts:214" />

Rotates by `angle` radians about the parent's X axis.

**Parameters**

- `angle` (number)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="worldrotatey" depth="3" name="worldRotateY" sig="worldRotateY(angle: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L219" sourceLabel="transform.ts:219" />

Rotates by `angle` radians about the parent's Y axis.

**Parameters**

- `angle` (number)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="worldrotatez" depth="3" name="worldRotateZ" sig="worldRotateZ(angle: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L224" sourceLabel="transform.ts:224" />

Rotates by `angle` radians about the parent's Z axis.

**Parameters**

- `angle` (number)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="worldtranslate" depth="3" name="worldTranslate" sig="worldTranslate(x: number, y: number, z: number): Transform" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L204" sourceLabel="transform.ts:204" />

Translates by `(x, y, z)` along the parent's axes.

**Parameters**

- `x` (number)
- `y` (number, default: `0`)
- `z` (number, default: `0`)

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

## Static Methods

<MemberHeading id="compose" depth="3" name="compose" sig="compose(parent: Transform, local: Transform): Transform" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L126" sourceLabel="transform.ts:126" />

Static form of `Transform#compose`: composes `parent × local` into a new transform (§4.4).

**Parameters**

- `parent` ([Transform](/keyframe-flow/docs/transform))
- `local` ([Transform](/keyframe-flow/docs/transform))

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="frominit" depth="3" name="fromInit" sig="fromInit(init: TransformInit): Transform" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L73" sourceLabel="transform.ts:73" />

Coerces developer-facing input (§4.1) into canonical components.

**Parameters**

- `init` ([TransformInit](/keyframe-flow/docs/transforminit))

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)

<MemberHeading id="frommatrix" depth="3" name="fromMatrix" sig="fromMatrix(matrix: Matrix4): Transform" />

<MemberMeta badges="static" sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L102" sourceLabel="transform.ts:102" />

Creates a transform by decomposing a matrix into TRS components. Throws explicitly for shear, reflection, perspective, or singular matrices (§15.1).

**Parameters**

- `matrix` ([Matrix4](/keyframe-flow/docs/matrix4))

**Returns**

- [`Transform`](/keyframe-flow/docs/transform)
