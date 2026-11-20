---
title: WebGPURenderTargetOptions
kind: interface
longname: WebGPURenderTargetOptions
description: Options for webgpu .
---

# WebGPURenderTargetOptions

<Signature
  code="interface WebGPURenderTargetOptions {
	onTransform?: (matrix: Float32Array) => void;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/webgpu-ts/#L5" label="webgpu.ts:5" />

Options for `webgpu`.

---

## Properties

<MemberHeading id="ontransform" depth="3" name="onTransform" sig="onTransform: (matrix: Float32Array) => void" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/targets/webgpu-ts/#L13" sourceLabel="webgpu.ts:13" />

Upload hook invoked after every evaluation with the new column-major matrix values — copy them into your uniform buffer (WGSL `mat4x4<f32>` uses the same column-major layout, §15) and encode draw calls. Keeping command encoding host-side leaves device, queue, and pipeline ownership with the host (§17.2).
