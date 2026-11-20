---
title: SvgTransformElementLike
kind: interface
longname: SvgTransformElementLike
description: The structural subset of an SVG element the adapter needs — anything with setAttribute works (SVG 1.1 transform attributes), no DOM lib types.
---

# SvgTransformElementLike

<Signature
  code="interface SvgTransformElementLike {
	setAttribute(name: string, value: string): void;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/svg-ts/#L8" label="svg.ts:8" />

The structural subset of an SVG element the adapter needs — anything with `setAttribute` works (SVG 1.1 transform attributes), no DOM lib types.

---

## Methods

<MemberHeading id="setattribute" depth="3" name="setAttribute" sig="setAttribute(name: string, value: string): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/svg-ts/#L10" sourceLabel="svg.ts:10" />

Sets an attribute — used for the SVG 1.1 `transform` attribute (§17).

**Parameters**

- `name` (string)
- `value` (string)

**Returns**

- `void`
