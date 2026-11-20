---
title: AnimationGroupOptions
kind: interface
longname: AnimationGroupOptions
description: Options for Animation.group .
---

# AnimationGroupOptions

<Signature
  code="interface AnimationGroupOptions {
	layout?: GroupLayout;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/animation/animation-ts/#L78" label="animation.ts:78" />

Options for `Animation.group`.

---

## Properties

<MemberHeading id="layout" depth="3" name="layout" sig="layout: GroupLayout" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/animation-ts/#L84" sourceLabel="animation.ts:84" />

`"sequence"` (default) plays children back to back over the summed duration; `"parallel"` runs them simultaneously over the longest child's duration, merging animated properties with later-wins precedence (§14).
