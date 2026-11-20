---
title: TransformKeyframe
kind: interface
longname: TransformKeyframe
description: A transform keyframe as authored (§6.1). easing controls the interpolation from this keyframe to the next one (§8); it is omitted on the final keyframe because there is no following segment.
---

# TransformKeyframe

<Signature
  code="interface TransformKeyframe {
	at: number;
	easing?: Easing;
	transform: TransformInit | Transform;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/animation/keyframes-ts/#L22" label="keyframes.ts:22" />

A transform keyframe as authored (§6.1). `easing` controls the interpolation from this keyframe to the next one (§8); it is omitted on the final keyframe because there is no following segment.

---

## Properties

<MemberHeading id="at" depth="3" name="at" sig="at: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L24" sourceLabel="keyframes.ts:24" />

Normalized timeline position in `[0, 1]`, strictly increasing (§6.3).

<MemberHeading id="easing" depth="3" name="easing" sig="easing: Easing" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L28" sourceLabel="keyframes.ts:28" />

Segment easing controlling interpolation to the next keyframe (§8).

<MemberHeading id="transform" depth="3" name="transform" sig="transform: TransformInit | Transform" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L26" sourceLabel="keyframes.ts:26" />

Complete transform or property-level partial value reached here (§7).
