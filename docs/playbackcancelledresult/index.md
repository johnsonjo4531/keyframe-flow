---
title: PlaybackCancelledResult
kind: interface
longname: PlaybackCancelledResult
description: The run was cancelled (superseded, cancel() , or disposal) before finishing (§12).
---

# PlaybackCancelledResult

<Signature
  code="interface PlaybackCancelledResult {
	status: 'cancelled';
}"
/>

<SourceLink href="/keyframe-flow/docs/source/playback/playback-ts/#L19" label="playback.ts:19" />

The run was cancelled (superseded, `cancel()`, or disposal) before finishing (§12).

---

## Properties

<MemberHeading id="status" depth="3" name="status" sig="status: 'cancelled'" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/playback/playback-ts/#L21" sourceLabel="playback.ts:21" />

Cancellation status discriminator.
