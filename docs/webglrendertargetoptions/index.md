---
title: WebGLRenderTargetOptions
kind: interface
longname: WebGLRenderTargetOptions
description: Options for webgl .
---

# WebGLRenderTargetOptions

<Signature
  code="interface WebGLRenderTargetOptions {
	onTransform?: (matrix: Float32Array) => void;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/webgl-ts/#L5" label="webgl.ts:5" />

Options for `webgl`.

---

## Properties

<MemberHeading id="ontransform" depth="3" name="onTransform" sig="onTransform: (matrix: Float32Array) => void" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/targets/webgl-ts/#L12" sourceLabel="webgl.ts:12" />

Upload hook invoked after every evaluation with the new column-major matrix values — typically `gl.uniformMatrix4fv(location, false, values)` plus a draw call. Returning here rather than owning a GL program keeps the adapter free of shader and pipeline assumptions (§17.2).
