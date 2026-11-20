---
title: PlaybackOptions
kind: interface
longname: PlaybackOptions
description: Construction options for Animation.attach / Playback .
---

# PlaybackOptions

<Signature
  code="interface PlaybackOptions {
	autoplay?: boolean;
	direction?: PlaybackDirectionMode;
	engine?: PlaybackEngine;
	iterations?: number | 'infinite';
	playbackRate?: number;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/playback/playback-ts/#L35" label="playback.ts:35" />

Construction options for `Animation.attach` / `Playback`.

---

## Properties

<MemberHeading id="autoplay" depth="3" name="autoplay" sig="autoplay: boolean" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L47" sourceLabel="playback.ts:47" />

When `true`, start playing immediately on attach. Defaults to `false`.

<MemberHeading id="direction" depth="3" name="direction" sig="direction: PlaybackDirectionMode" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L43" sourceLabel="playback.ts:43" />

Direction behavior across iterations (§13). Defaults to `"normal"`.

<MemberHeading id="engine" depth="3" name="engine" sig="engine: PlaybackEngine" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L49" sourceLabel="playback.ts:49" />

Engine driving this playback. Defaults to the shared default engine.

<MemberHeading id="iterations" depth="3" name="iterations" sig="iterations: number | 'infinite'" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L41" sourceLabel="playback.ts:41" />

Total iterations including the initial one (§13): `1` (default) plays once, a finite integer ≥ 1 repeats, `"infinite"` never naturally completes.

<MemberHeading id="playbackrate" depth="3" name="playbackRate" sig="playbackRate: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L45" sourceLabel="playback.ts:45" />

Initial playback rate (§11.1). Any finite number; defaults to `1`.
