---
title: Canvas2DTargetOptions
kind: interface
longname: Canvas2DTargetOptions
description: Options for canvas .
---

# Canvas2DTargetOptions

<Signature
  code="interface Canvas2DTargetOptions {
	perspective?: number;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/canvas-ts/#L15" label="canvas.ts:15" />

Options for `canvas`.

---

## Properties

<MemberHeading id="perspective" depth="3" name="perspective" sig="perspective: number" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/targets/canvas-ts/#L21" sourceLabel="canvas.ts:21" />

Camera distance in user-space units for the perspective projection step. Omit (or `Infinity`) for orthographic projection, which keeps parallel lines parallel and is the right default for most 2D scenes (§17.3).
