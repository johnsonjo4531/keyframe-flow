---
title: Keyframe
kind: interface
longname: Keyframe
description: "A generic keyframe: a value attached to a normalized position (§6.1). at is progress in [0, 1] , independent of duration (§6.2)."
---

# Keyframe

<Signature
  code="interface Keyframe<T> {
	at: number;
	value: T;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/animation/keyframes-ts/#L10" label="keyframes.ts:10" />

A generic keyframe: a value attached to a normalized position (§6.1). `at` is progress in `[0, 1]`, independent of duration (§6.2).

**Type Parameters**

- `T`

---

## Properties

<MemberHeading id="at" depth="3" name="at" sig="at: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L12" sourceLabel="keyframes.ts:12" />

Normalized timeline position in `[0, 1]` (§6.1).

<MemberHeading id="value" depth="3" name="value" sig="value: T" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/animation/keyframes-ts/#L14" sourceLabel="keyframes.ts:14" />

The value reached at this keyframe.
