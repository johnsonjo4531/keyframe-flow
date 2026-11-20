---
title: RotationMode
kind: typedef
longname: RotationMode
description: "How rotation interpolates between keyframes (§9.1). \"quaternion\" (default): SLERP with shortest-path — the correct choice for orientations, but equivalent orientations never describe a revolution. \"angular\" : component-wise interpolation of authored Euler angles in radians, enabling full revolutions without intermediate keyframes (§9.1)."
---

# RotationMode

<Signature code="RotationMode = 'quaternion' | 'angular'" />

<SourceLink href="/keyframe-flow/docs/source/animation/animation-ts/#L26" label="animation.ts:26" />

How rotation interpolates between keyframes (§9.1).

- `"quaternion"` (default): SLERP with shortest-path — the correct choice for orientations, but equivalent orientations never describe a revolution.
- `"angular"`: component-wise interpolation of authored Euler angles in radians, enabling full revolutions without intermediate keyframes (§9.1).
