---
title: TransformInit
kind: interface
longname: TransformInit
description: Developer-facing construction input (§4.1). Rotation may be given as a quaternion or as Euler angles in radians [x, y, z] — the convenience construction interface from §4.3. Scale accepts a uniform number.
---

# TransformInit

<Signature
  code="interface TransformInit {
	position?: Vector3Like;
	rotation?: readonly [number, number, number] | QuaternionObject;
	scale?: number | Vector3Like;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/transform/transform-ts/#L24" label="transform.ts:24" />

Developer-facing construction input (§4.1). Rotation may be given as a quaternion or as Euler angles in radians `[x, y, z]` — the convenience construction interface from §4.3. Scale accepts a uniform number.

---

## Properties

<MemberHeading id="position" depth="3" name="position" sig="position: Vector3Like" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L26" sourceLabel="transform.ts:26" />

Position; omitted means identity.

<MemberHeading id="rotation" depth="3" name="rotation" sig="rotation: readonly [number, number, number] | QuaternionObject" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L28" sourceLabel="transform.ts:28" />

Quaternion (or `{x, y, z, w}`), or Euler radians `[x, y, z]` applied X → Y → Z (§4.3).

<MemberHeading id="scale" depth="3" name="scale" sig="scale: number | Vector3Like" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/transform-ts/#L30" sourceLabel="transform.ts:30" />

Per-axis vector, or a uniform scalar; omitted means `(1, 1, 1)`.
