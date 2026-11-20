---
title: AnimationKeyframesDefinition
kind: interface
longname: AnimationKeyframesDefinition
description: Keyframe definition (§5.3, §5.4) with an eager keyframe source (§5.5).
---

# AnimationKeyframesDefinition

<Signature
  code="interface AnimationKeyframesDefinition extends AnimationDefinitionBase {
	duration: number;
	easing?: Easing;
	interpolation?: AnimationInterpolation;
	keyframes: TransformKeyframeSource;
	rotationMode?: RotationMode;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/animation/animation-ts/#L66" label="animation.ts:66" />

Keyframe definition (§5.3, §5.4) with an eager keyframe source (§5.5).

#### Hierarchy

- `AnimationDefinitionBase`
- `AnimationKeyframesDefinition`

---

## Properties

<MemberHeading id="duration" depth="3" name="duration" sig="duration: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L43" sourceLabel="animation.ts:43" />

_Inherited from&#x20;_`duration`

Total duration in milliseconds (§6.2).

<MemberHeading id="easing" depth="3" name="easing" sig="easing: Easing" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L45" sourceLabel="animation.ts:45" />

_Inherited from&#x20;_`easing`

Animation-level default easing (§8). Defaults to `"linear"`.

<MemberHeading id="interpolation" depth="3" name="interpolation" sig="interpolation: AnimationInterpolation" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L49" sourceLabel="animation.ts:49" />

_Inherited from&#x20;_`interpolation`

Advanced interpolation strategy (§9.2). Defaults to `"trs"`.

<MemberHeading id="keyframes" depth="3" name="keyframes" sig="keyframes: TransformKeyframeSource" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L68" sourceLabel="animation.ts:68" />

Array, iterable, generator instance, or factory function — consumed eagerly once at definition time (§5.4, §5.5).

<MemberHeading id="rotationmode" depth="3" name="rotationMode" sig="rotationMode: RotationMode" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L47" sourceLabel="animation.ts:47" />

_Inherited from&#x20;_`rotationMode`

Rotation interpolation strategy (§9.1). Defaults to `"quaternion"`.
