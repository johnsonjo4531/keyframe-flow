---
title: CanvasRenderingContext2DLike
kind: interface
longname: CanvasRenderingContext2DLike
description: The structural subset of a Canvas 2D context the adapter needs — only setTransform is required, so mocks and offscreen contexts work too. No DOM lib types are referenced (§2 principle 1).
---

# CanvasRenderingContext2DLike

<Signature
  code="interface CanvasRenderingContext2DLike {
	setTransform(a: number, b: number, c: number, d: number, e: number, f: number): void;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/canvas-ts/#L9" label="canvas.ts:9" />

The structural subset of a Canvas 2D context the adapter needs — only `setTransform` is required, so mocks and offscreen contexts work too. No DOM lib types are referenced (§2 principle 1).

---

## Methods

<MemberHeading
  id="settransform"
  depth="3"
  name="setTransform"
  sig="setTransform(
	a: number,
	b: number,
	c: number,
	d: number,
	e: number,
	f: number,
): void"
/>

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/canvas-ts/#L11" sourceLabel="canvas.ts:11" />

Replaces the context's current transform matrix (CTM) — never composes (§17.3).

**Parameters**

- `a` (number)
- `b` (number)
- `c` (number)
- `d` (number)
- `e` (number)
- `f` (number)

**Returns**

- `void`
