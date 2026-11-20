---
title: PlaybackEngineOptions
kind: interface
longname: PlaybackEngineOptions
description: Injectable time sources for a PlaybackEngine (§16).
---

# PlaybackEngineOptions

<Signature
  code="interface PlaybackEngineOptions {
	clock?: Clock;
	scheduler?: Scheduler;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/playback/engine-ts/#L17" label="engine.ts:17" />

Injectable time sources for a `PlaybackEngine` (§16).

---

## Properties

<MemberHeading id="clock" depth="3" name="clock" sig="clock: Clock" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/engine-ts/#L19" sourceLabel="engine.ts:19" />

Time source. Defaults to `systemClock`.

<MemberHeading id="scheduler" depth="3" name="scheduler" sig="scheduler: Scheduler" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/engine-ts/#L21" sourceLabel="engine.ts:21" />

Frame callback source. Defaults to `createFrameScheduler()`.
