---
title: DOMMatrixLike
kind: interface
longname: DOMMatrixLike
description: "The named members shared by DOMMatrixReadOnly and DOMMatrix . CSSOM member names are transposed relative to conventional mathematical m<row><column> naming: mXY is the element at math row Y − 1 , column X − 1 . ( transformPoint computes x' = x·m11 + y·m21 + z·m31 + m41 , so the translation lives in m41/m42/m43 .) See §15.2 — conversions must preserve mathematical meaning, not raw element order."
---

# DOMMatrixLike

<Signature
  code="interface DOMMatrixLike {
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
}"
/>

<SourceLink href="/keyframe-flow/docs/source/types-d-ts/#L21" label="types.d.ts:21" />

The named members shared by `DOMMatrixReadOnly` and `DOMMatrix`.

CSSOM member names are transposed relative to conventional mathematical `m<row><column>` naming: `mXY` is the element at math row `Y − 1`, column `X − 1`. (`transformPoint` computes `x' = x·m11 + y·m21 + z·m31 + m41`, so the translation lives in `m41/m42/m43`.) See §15.2 — conversions must preserve mathematical meaning, not raw element order.

---

## Properties

<MemberHeading id="m11" depth="3" name="m11" sig="m11: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L23" sourceLabel="types.d.ts:23" />

CSSOM `m11` — math row 1, column 1 (basis image of x̂, x part).

<MemberHeading id="m12" depth="3" name="m12" sig="m12: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L25" sourceLabel="types.d.ts:25" />

CSSOM `m12` — math row 2, column 1 (basis image of x̂, y part).

<MemberHeading id="m13" depth="3" name="m13" sig="m13: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L27" sourceLabel="types.d.ts:27" />

CSSOM `m13` — math row 3, column 1 (basis image of x̂, z part).

<MemberHeading id="m14" depth="3" name="m14" sig="m14: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L29" sourceLabel="types.d.ts:29" />

CSSOM `m14` — math row 4, column 1 (x basis perspective term).

<MemberHeading id="m21" depth="3" name="m21" sig="m21: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L31" sourceLabel="types.d.ts:31" />

CSSOM `m21` — math row 1, column 2 (basis image of ŷ, x part).

<MemberHeading id="m22" depth="3" name="m22" sig="m22: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L33" sourceLabel="types.d.ts:33" />

CSSOM `m22` — math row 2, column 2 (basis image of ŷ, y part).

<MemberHeading id="m23" depth="3" name="m23" sig="m23: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L35" sourceLabel="types.d.ts:35" />

CSSOM `m23` — math row 3, column 2 (basis image of ŷ, z part).

<MemberHeading id="m24" depth="3" name="m24" sig="m24: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L37" sourceLabel="types.d.ts:37" />

CSSOM `m24` — math row 4, column 2 (y basis perspective term).

<MemberHeading id="m31" depth="3" name="m31" sig="m31: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L39" sourceLabel="types.d.ts:39" />

CSSOM `m31` — math row 1, column 3 (basis image of ẑ, x part).

<MemberHeading id="m32" depth="3" name="m32" sig="m32: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L41" sourceLabel="types.d.ts:41" />

CSSOM `m32` — math row 2, column 3 (basis image of ẑ, y part).

<MemberHeading id="m33" depth="3" name="m33" sig="m33: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L43" sourceLabel="types.d.ts:43" />

CSSOM `m33` — math row 3, column 3 (basis image of ẑ, z part).

<MemberHeading id="m34" depth="3" name="m34" sig="m34: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L45" sourceLabel="types.d.ts:45" />

CSSOM `m34` — math row 4, column 3 (z basis perspective term).

<MemberHeading id="m41" depth="3" name="m41" sig="m41: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L47" sourceLabel="types.d.ts:47" />

CSSOM `m41` — math row 1, column 4: translation x.

<MemberHeading id="m42" depth="3" name="m42" sig="m42: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L49" sourceLabel="types.d.ts:49" />

CSSOM `m42` — math row 2, column 4: translation y.

<MemberHeading id="m43" depth="3" name="m43" sig="m43: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L51" sourceLabel="types.d.ts:51" />

CSSOM `m43` — math row 3, column 4: translation z.

<MemberHeading id="m44" depth="3" name="m44" sig="m44: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/types-d-ts/#L53" sourceLabel="types.d.ts:53" />

CSSOM `m44` — math row 4, column 4: homogeneous coordinate (usually 1).
