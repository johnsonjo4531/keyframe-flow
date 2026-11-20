---
title: TransformComponents
kind: interface
longname: TransformComponents
description: "The canonical component representation of a transform (§4.3): position, quaternion rotation, and scale. Shared by the transform and matrix subsystems; declared as a pure type so neither module depends on the other at runtime."
---

# TransformComponents

<Signature
  code="interface TransformComponents {
	position: Vector3;
	rotation: Quaternion;
	scale: Vector3;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/transform/components-ts/#L10" label="components.ts:10" />

The canonical component representation of a transform (§4.3): position, quaternion rotation, and scale. Shared by the transform and matrix subsystems; declared as a pure type so neither module depends on the other at runtime.

---

## Properties

<MemberHeading id="position" depth="3" name="position" sig="position: Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/components-ts/#L12" sourceLabel="components.ts:12" />

Translation component.

<MemberHeading id="rotation" depth="3" name="rotation" sig="rotation: Quaternion" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/components-ts/#L14" sourceLabel="components.ts:14" />

Rotation component (unit quaternion).

<MemberHeading id="scale" depth="3" name="scale" sig="scale: Vector3" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/transform/components-ts/#L16" sourceLabel="components.ts:16" />

Per-axis scale component; non-negative by construction (§4.3).
