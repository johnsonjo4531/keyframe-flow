---
title: NormalizedKeyframe
kind: interface
longname: NormalizedKeyframe
description: "A keyframe after eager normalization (§5.5): transforms are coerced to Transform instances and named easings are resolved to functions once, so every playback instance shares identical, pre-validated timeline data. rotationAngles carries authored Euler angles in radians (X→Y→Z) when the definition opted into angular rotation tracks (§9.1, T35). Quaternion-only authored values are decomposed instead; a quaternion alone cannot express full revolutions, which is exactly what captured angles preserve."
---

# NormalizedKeyframe

<Signature
  code="interface NormalizedKeyframe {
	at: number;
	easing?: EasingFunction;
	rotationAngles?: readonly [number, number, number];
	transform: Transform;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/animation/keyframes-ts/#L41" label="keyframes.ts:41" />

A keyframe after eager normalization (§5.5): transforms are coerced to `Transform` instances and named easings are resolved to functions once, so every playback instance shares identical, pre-validated timeline data.

`rotationAngles` carries authored Euler angles in radians (X→Y→Z) when the definition opted into angular rotation tracks (§9.1, T35). Quaternion-only authored values are decomposed instead; a quaternion alone cannot express full revolutions, which is exactly what captured angles preserve.

---

## Properties

<MemberHeading id="at" depth="3" name="at" sig="at: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L43" sourceLabel="keyframes.ts:43" />

Normalized timeline position in `[0, 1]` (§6.1).

<MemberHeading id="easing" depth="3" name="easing" sig="easing: EasingFunction" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L47" sourceLabel="keyframes.ts:47" />

Resolved segment easing, or `undefined` to use the animation default (§8).

<MemberHeading id="rotationangles" depth="3" name="rotationAngles" sig="rotationAngles: readonly [number, number, number]" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L49" sourceLabel="keyframes.ts:49" />

Authored Euler angles in radians for angular rotation tracks (§9.1).

<MemberHeading id="transform" depth="3" name="transform" sig="transform: Transform" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L45" sourceLabel="keyframes.ts:45" />

Fully coerced transform — partial authoring inputs are merged away (§7).
