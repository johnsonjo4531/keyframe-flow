---
title: WebGPURenderTarget
kind: class
longname: WebGPURenderTarget
description: WebGPU render target adapter (§3.6, §20 M5).
---

# WebGPURenderTarget

<SourceLink href="/keyframe-flow/docs/source/targets/webgpu-ts/#L28" label="webgpu.ts:28" />

WebGPU render target adapter (§3.6, §20 M5).

**Remarks**

The adapter owns only rendering state: the latest evaluated transform as a column-major `Float32Array`, matching WGSL's `mat4x4<f32>` uniform layout element-for-element (§15). It creates no GPU resources, never touches playback time or lifecycle (§3.6), and disposal cannot destroy devices, buffers, or encoders (Appendix B.8) — hosts encode work in the `onTransform` hook or read [WebGPURenderTarget.matrixValues](/keyframe-flow/docs/webgpurendertarget#matrixvalues) from their own frame loop.

---

## Constructors

<MemberHeading
  id="constructor"
  depth="3"
  name="constructor"
  sig="new WebGPURenderTarget(
	options: WebGPURenderTargetOptions,
): WebGPURenderTarget"
/>

**Parameters**

- `options` ([WebGPURenderTargetOptions](/keyframe-flow/docs/webgpurendertargetoptions), default: `{}`)

**Returns**

`WebGPURenderTarget`

#### Implements

- [`RenderTarget`](/keyframe-flow/docs/rendertarget)

---

## Accessors

<MemberHeading id="matrixvalues" depth="3" name="matrixValues" sig="get matrixValues(): Float32Array" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/webgpu-ts/#L39" sourceLabel="webgpu.ts:39" />

A copy of the latest transform in column-major WGSL uniform layout (§15).

## Methods

<MemberHeading id="copymatrixvaluesto" depth="3" name="copyMatrixValuesTo" sig="copyMatrixValuesTo(out: Float32Array): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/webgpu-ts/#L44" sourceLabel="webgpu.ts:44" />

Copies the latest values into `out` without allocating (performance, §2.9).

**Parameters**

- `out` (Float32Array)

**Returns**

- `void`

<MemberHeading id="settransform" depth="3" name="setTransform" sig="setTransform(matrix: Matrix4): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/webgpu-ts/#L53" sourceLabel="webgpu.ts:53" />

_Implementation of&#x20;_[`setTransform`](/keyframe-flow/docs/rendertarget#settransform)

Receives the evaluated transform as a canonical `Matrix4` (§17.1).

**Parameters**

- `matrix` ([Matrix4](/keyframe-flow/docs/matrix4))

**Returns**

- `void`
