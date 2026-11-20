---
title: DOMPointOutput
kind: interface
longname: DOMPointOutput
description: Point produced by DOMMatrixWritable#transformPoint .
---

# DOMPointOutput

<Signature
  code="interface DOMPointOutput {
	w: number;
	x: number;
	y: number;
	z: number;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/types-d-ts/#L69" label="types.d.ts:69" />

Point produced by `DOMMatrixWritable#transformPoint`.

---

## Properties

<MemberHeading id="w" depth="3" name="w" sig="w: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L77" sourceLabel="types.d.ts:77" />

Homogeneous coordinate of the result.

<MemberHeading id="x" depth="3" name="x" sig="x: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L71" sourceLabel="types.d.ts:71" />

Transformed X (perspective-divided when `w ≠ 1`).

<MemberHeading id="y" depth="3" name="y" sig="y: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L73" sourceLabel="types.d.ts:73" />

Transformed Y.

<MemberHeading id="z" depth="3" name="z" sig="z: number" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/types-d-ts/#L75" sourceLabel="types.d.ts:75" />

Transformed Z.
