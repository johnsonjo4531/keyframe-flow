---
title: AnimationFromToDefinition
kind: interface
longname: AnimationFromToDefinition
description: From/to definition (§5.2). from and to accept complete transforms or property-level partial objects (§7); unspecified properties are preserved from the explicit starting transform, falling back to documented identity defaults when no starting transform is supplied.
---

# AnimationFromToDefinition

<Signature
  code="interface AnimationFromToDefinition extends AnimationDefinitionBase {
	duration: number;
	easing?: Easing;
	from?: TransformInit | Transform;
	interpolation?: AnimationInterpolation;
	rotationMode?: RotationMode;
	to?: TransformInit | Transform;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/animation/animation-ts/#L58" label="animation.ts:58" />

From/to definition (§5.2). `from` and `to` accept complete transforms or property-level partial objects (§7); unspecified properties are preserved from the explicit starting transform, falling back to documented identity defaults when no starting transform is supplied.

#### Hierarchy

- `AnimationDefinitionBase`
- `AnimationFromToDefinition`

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

<MemberHeading id="from" depth="3" name="from" sig="from: TransformInit | Transform" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L60" sourceLabel="animation.ts:60" />

Starting transform or property-level partial (§5.2, §7); omitted means identity.

<MemberHeading id="interpolation" depth="3" name="interpolation" sig="interpolation: AnimationInterpolation" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L49" sourceLabel="animation.ts:49" />

_Inherited from&#x20;_`interpolation`

Advanced interpolation strategy (§9.2). Defaults to `"trs"`.

<MemberHeading id="rotationmode" depth="3" name="rotationMode" sig="rotationMode: RotationMode" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L47" sourceLabel="animation.ts:47" />

_Inherited from&#x20;_`rotationMode`

Rotation interpolation strategy (§9.1). Defaults to `"quaternion"`.

<MemberHeading id="to" depth="3" name="to" sig="to: TransformInit | Transform" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L62" sourceLabel="animation.ts:62" />

Ending transform or property-level partial; properties not specified are preserved from `from` (§7).
