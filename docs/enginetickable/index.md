---
title: EngineTickable
kind: interface
longname: EngineTickable
description: The minimal contract the engine needs from a playback instance. Playback instances implement it; keeping it structural avoids a runtime import cycle between the engine and playback modules.
---

# EngineTickable

<Signature
  code="interface EngineTickable {
	onEngineUpdate(timeMs: number): void;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/playback/engine-ts/#L11" label="engine.ts:11" />

The minimal contract the engine needs from a playback instance. Playback instances implement it; keeping it structural avoids a runtime import cycle between the engine and playback modules.

---

## Methods

<MemberHeading id="onengineupdate" depth="3" name="onEngineUpdate" sig="onEngineUpdate(timeMs: number): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/playback/engine-ts/#L13" sourceLabel="engine.ts:13" />

Called by the engine with the current clock timestamp in ms (§16).

**Parameters**

- `timeMs` (number)

**Returns**

- `void`
