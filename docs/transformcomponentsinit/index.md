---
title: TransformComponentsInit
kind: interface
longname: TransformComponentsInit
description: Canonical construction input; omitted (or undefined) parts default to identity.
---

# TransformComponentsInit

<Signature
  code="interface TransformComponentsInit {
	position?: Vector3Like;
	rotation?: QuaternionObject;
	scale?: Vector3Like;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/transform/transform-ts/#L10" label="transform.ts:10" />

Canonical construction input; omitted (or undefined) parts default to identity.

---

## Properties

<MemberHeading id="position" depth="3" name="position" sig="position: Vector3Like" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L12" sourceLabel="transform.ts:12" />

Position component input (§4.3). Defaults to `(0, 0, 0)`.

<MemberHeading id="rotation" depth="3" name="rotation" sig="rotation: QuaternionObject" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L14" sourceLabel="transform.ts:14" />

Rotation component input — quaternion or structural `{x, y, z, w}`. Defaults to identity.

<MemberHeading id="scale" depth="3" name="scale" sig="scale: Vector3Like" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L16" sourceLabel="transform.ts:16" />

Scale component input (§4.3). Defaults to `(1, 1, 1)`.
