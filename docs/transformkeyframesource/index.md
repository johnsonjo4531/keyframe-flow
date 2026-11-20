---
title: TransformKeyframeSource
kind: typedef
longname: TransformKeyframeSource
description: "Sources accepted for keyframes definitions (§5.4): arrays, synchronous iterables, generator instances, and functions returning synchronous iterables. All are consumed eagerly and exactly once when the animation definition is created (§5.5)."
---

# TransformKeyframeSource

<Signature code="TransformKeyframeSource = readonly TransformKeyframe[] | Iterable<TransformKeyframe> | (() => Iterable<TransformKeyframe>)" />

<SourceLink href="/keyframe-flow/docs/source/animation/keyframes-ts/#L58" label="keyframes.ts:58" />

Sources accepted for `keyframes` definitions (§5.4): arrays, synchronous iterables, generator instances, and functions returning synchronous iterables. All are consumed eagerly and exactly once when the animation definition is created (§5.5).
