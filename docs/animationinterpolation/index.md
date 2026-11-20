---
title: AnimationInterpolation
kind: typedef
longname: AnimationInterpolation
description: "Interpolation strategy for animation sampling (§9). \"trs\" (default): property-aware interpolation — linear translation and scale, quaternion SLERP or angular rotation interpolation (§9.1). \"raw-matrix\" : explicit advanced raw element-wise interpolation of the endpoint matrices (§9.2). Raw results that are not TRS-decomposable throw explicitly rather than being approximated; interpolated rotations in particular usually produce shear."
---

# AnimationInterpolation

<Signature code="AnimationInterpolation = 'trs' | 'raw-matrix'" />

<SourceLink href="/keyframe-flow/docs/source/animation/animation-ts/#L38" label="animation.ts:38" />

Interpolation strategy for animation sampling (§9).

- `"trs"` (default): property-aware interpolation — linear translation and scale, quaternion SLERP or angular rotation interpolation (§9.1).
- `"raw-matrix"`: explicit advanced raw element-wise interpolation of the endpoint matrices (§9.2). Raw results that are not TRS-decomposable throw explicitly rather than being approximated; interpolated rotations in particular usually produce shear.
