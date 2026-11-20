---
title: DOMMatrixWritable
kind: interface
longname: DOMMatrixWritable
description: A mutable DOMMatrix instance with the subset of members used here.
---

# DOMMatrixWritable

<Signature
  code="interface DOMMatrixWritable extends DOMMatrixLike {
	a: number;
	b: number;
	c: number;
	d: number;
	e: number;
	f: number;
	is2D: boolean;
	isIdentity: boolean;
	m11: number;
	m12: number;
	m13: number;
	m14: number;
	m21: number;
	m22: number;
	m23: number;
	m24: number;
	m31: number;
	m32: number;
	m33: number;
	m34: number;
	m41: number;
	m42: number;
	m43: number;
	m44: number;
	multiply(other: DOMMatrixLike): DOMMatrixWritable;
	toFloat32Array(): Float32Array;
	toFloat64Array(): Float64Array;
	transformPoint(point: DOMPointInput): DOMPointOutput;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/types-d-ts/#L81" label="types.d.ts:81" />

A mutable `DOMMatrix` instance with the subset of members used here.

#### Hierarchy

- [`DOMMatrixLike`](/keyframe-flow/docs/dommatrixlike)
- `DOMMatrixWritable`

---

## Properties

<MemberHeading id="a" depth="3" name="a" sig="a: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L121" sourceLabel="types.d.ts:121" />

Short alias for `m11` — 2D affine scale-x (§17).

<MemberHeading id="b" depth="3" name="b" sig="b: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L123" sourceLabel="types.d.ts:123" />

Short alias for `m12` — 2D affine skew/skew-y component.

<MemberHeading id="c" depth="3" name="c" sig="c: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L125" sourceLabel="types.d.ts:125" />

Short alias for `m21` — 2D affine skew/skew-x component.

<MemberHeading id="d" depth="3" name="d" sig="d: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L127" sourceLabel="types.d.ts:127" />

Short alias for `m22` — 2D affine scale-y (§17).

<MemberHeading id="e" depth="3" name="e" sig="e: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L129" sourceLabel="types.d.ts:129" />

Short alias for `m41` — 2D affine translation x.

<MemberHeading id="f" depth="3" name="f" sig="f: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L131" sourceLabel="types.d.ts:131" />

Short alias for `m42` — 2D affine translation y.

<MemberHeading id="is2d" depth="3" name="is2D" sig="is2D: boolean" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L116" sourceLabel="types.d.ts:116" />

True when every perspective-related entry is at its identity value.

<MemberHeading id="isidentity" depth="3" name="isIdentity" sig="isIdentity: boolean" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L118" sourceLabel="types.d.ts:118" />

True when the matrix is exactly the identity.

<MemberHeading id="m11" depth="3" name="m11" sig="m11: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L83" sourceLabel="types.d.ts:83" />

_Overrides&#x20;_[`m11`](/keyframe-flow/docs/dommatrixlike#m11)

CSSOM `m11` — math row 1, column 1 (writable).

<MemberHeading id="m12" depth="3" name="m12" sig="m12: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L85" sourceLabel="types.d.ts:85" />

_Overrides&#x20;_[`m12`](/keyframe-flow/docs/dommatrixlike#m12)

CSSOM `m12` — math row 2, column 1 (writable).

<MemberHeading id="m13" depth="3" name="m13" sig="m13: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L87" sourceLabel="types.d.ts:87" />

_Overrides&#x20;_[`m13`](/keyframe-flow/docs/dommatrixlike#m13)

CSSOM `m13` — math row 3, column 1 (writable).

<MemberHeading id="m14" depth="3" name="m14" sig="m14: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L89" sourceLabel="types.d.ts:89" />

_Overrides&#x20;_[`m14`](/keyframe-flow/docs/dommatrixlike#m14)

CSSOM `m14` — math row 4, column 1 (writable).

<MemberHeading id="m21" depth="3" name="m21" sig="m21: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L91" sourceLabel="types.d.ts:91" />

_Overrides&#x20;_[`m21`](/keyframe-flow/docs/dommatrixlike#m21)

CSSOM `m21` — math row 1, column 2 (writable).

<MemberHeading id="m22" depth="3" name="m22" sig="m22: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L93" sourceLabel="types.d.ts:93" />

_Overrides&#x20;_[`m22`](/keyframe-flow/docs/dommatrixlike#m22)

CSSOM `m22` — math row 2, column 2 (writable).

<MemberHeading id="m23" depth="3" name="m23" sig="m23: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L95" sourceLabel="types.d.ts:95" />

_Overrides&#x20;_[`m23`](/keyframe-flow/docs/dommatrixlike#m23)

CSSOM `m23` — math row 3, column 2 (writable).

<MemberHeading id="m24" depth="3" name="m24" sig="m24: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L97" sourceLabel="types.d.ts:97" />

_Overrides&#x20;_[`m24`](/keyframe-flow/docs/dommatrixlike#m24)

CSSOM `m24` — math row 4, column 2 (writable).

<MemberHeading id="m31" depth="3" name="m31" sig="m31: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L99" sourceLabel="types.d.ts:99" />

_Overrides&#x20;_[`m31`](/keyframe-flow/docs/dommatrixlike#m31)

CSSOM `m31` — math row 1, column 3 (writable).

<MemberHeading id="m32" depth="3" name="m32" sig="m32: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L101" sourceLabel="types.d.ts:101" />

_Overrides&#x20;_[`m32`](/keyframe-flow/docs/dommatrixlike#m32)

CSSOM `m32` — math row 2, column 3 (writable).

<MemberHeading id="m33" depth="3" name="m33" sig="m33: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L103" sourceLabel="types.d.ts:103" />

_Overrides&#x20;_[`m33`](/keyframe-flow/docs/dommatrixlike#m33)

CSSOM `m33` — math row 3, column 3 (writable).

<MemberHeading id="m34" depth="3" name="m34" sig="m34: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L105" sourceLabel="types.d.ts:105" />

_Overrides&#x20;_[`m34`](/keyframe-flow/docs/dommatrixlike#m34)

CSSOM `m34` — math row 4, column 3 (writable).

<MemberHeading id="m41" depth="3" name="m41" sig="m41: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L107" sourceLabel="types.d.ts:107" />

_Overrides&#x20;_[`m41`](/keyframe-flow/docs/dommatrixlike#m41)

CSSOM `m41` — translation x (writable).

<MemberHeading id="m42" depth="3" name="m42" sig="m42: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L109" sourceLabel="types.d.ts:109" />

_Overrides&#x20;_[`m42`](/keyframe-flow/docs/dommatrixlike#m42)

CSSOM `m42` — translation y (writable).

<MemberHeading id="m43" depth="3" name="m43" sig="m43: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L111" sourceLabel="types.d.ts:111" />

_Overrides&#x20;_[`m43`](/keyframe-flow/docs/dommatrixlike#m43)

CSSOM `m43` — translation z (writable).

<MemberHeading id="m44" depth="3" name="m44" sig="m44: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L113" sourceLabel="types.d.ts:113" />

_Overrides&#x20;_[`m44`](/keyframe-flow/docs/dommatrixlike#m44)

CSSOM `m44` — homogeneous coordinate (writable).

## Methods

<MemberHeading id="multiply" depth="3" name="multiply" sig="multiply(other: DOMMatrixLike): DOMMatrixWritable" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L134" sourceLabel="types.d.ts:134" />

Returns `this × other` as a new matrix (CSSOM order).

**Parameters**

- `other` ([DOMMatrixLike](/keyframe-flow/docs/dommatrixlike))

**Returns**

- [`DOMMatrixWritable`](/keyframe-flow/docs/dommatrixwritable)

<MemberHeading id="tofloat32array" depth="3" name="toFloat32Array" sig="toFloat32Array(): Float32Array" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L140" sourceLabel="types.d.ts:140" />

The 16 entries in CSSOM array order (`a11, a12, …` row-major text).

**Returns**

- `Float32Array`

<MemberHeading id="tofloat64array" depth="3" name="toFloat64Array" sig="toFloat64Array(): Float64Array" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L143" sourceLabel="types.d.ts:143" />

The 16 entries in CSSOM array order, double precision.

**Returns**

- `Float64Array`

<MemberHeading id="transformpoint" depth="3" name="transformPoint" sig="transformPoint(point: DOMPointInput): DOMPointOutput" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L137" sourceLabel="types.d.ts:137" />

Applies the transform to `point`, returning a new point.

**Parameters**

- `point` ([DOMPointInput](/keyframe-flow/docs/dompointinput))

**Returns**

- [`DOMPointOutput`](/keyframe-flow/docs/dompointoutput)
