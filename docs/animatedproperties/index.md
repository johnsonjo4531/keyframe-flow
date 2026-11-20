---
title: AnimatedProperties
kind: interface
longname: AnimatedProperties
description: Which transform properties an animation actually changes (§14).
---

# AnimatedProperties

<Signature
  code="interface AnimatedProperties {
	position: boolean;
	rotation: boolean;
	scale: boolean;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/animation/animation-ts/#L88" label="animation.ts:88" />

Which transform properties an animation actually changes (§14).

---

## Properties

<MemberHeading id="position" depth="3" name="position" sig="position: boolean" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L90" sourceLabel="animation.ts:90" />

True when position changes anywhere in the timeline (§14).

<MemberHeading id="rotation" depth="3" name="rotation" sig="rotation: boolean" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L92" sourceLabel="animation.ts:92" />

True when orientation changes anywhere — q/−q count as equal (§14).

<MemberHeading id="scale" depth="3" name="scale" sig="scale: boolean" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L94" sourceLabel="animation.ts:94" />

True when scale changes anywhere in the timeline (§14).
