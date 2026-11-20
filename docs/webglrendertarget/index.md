---
title: WebGLRenderTarget
kind: class
longname: WebGLRenderTarget
description: WebGL render target adapter (§3.6, §20 M5).
---

# WebGLRenderTarget

<SourceLink href="/keyframe-flow/docs/source/targets/webgl-ts/#L27" label="webgl.ts:27" />

WebGL render target adapter (§3.6, §20 M5).

**Remarks**

The adapter owns only rendering state: the latest evaluated transform as a column-major `Float32Array` — the exact layout `gl.uniformMatrix4fv` and GLSL `mat4` consume (§15) — plus an optional upload callback. It creates no GL resources, never touches playback time or lifecycle (§3.6), and disposal cannot destroy contexts, buffers, or programs (Appendix B.8). Hosts draw in the `onTransform` hook or poll [WebGLRenderTarget.matrixValues](/keyframe-flow/docs/webglrendertarget#matrixvalues) from their own render loop.

---

## Constructors

<MemberHeading
  id="constructor"
  depth="3"
  name="constructor"
  sig="new WebGLRenderTarget(
	options: WebGLRenderTargetOptions,
): WebGLRenderTarget"
/>

**Parameters**

- `options` ([WebGLRenderTargetOptions](/keyframe-flow/docs/webglrendertargetoptions), default: `{}`)

**Returns**

`WebGLRenderTarget`

#### Implements

- [`RenderTarget`](/keyframe-flow/docs/rendertarget)

---

## Accessors

<MemberHeading id="matrixvalues" depth="3" name="matrixValues" sig="get matrixValues(): Float32Array" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/webgl-ts/#L38" sourceLabel="webgl.ts:38" />

A copy of the latest transform in column-major GL upload order (§15).

## Methods

<MemberHeading id="copymatrixvaluesto" depth="3" name="copyMatrixValuesTo" sig="copyMatrixValuesTo(out: Float32Array): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/webgl-ts/#L43" sourceLabel="webgl.ts:43" />

Copies the latest values into `out` without allocating (performance, §2.9).

**Parameters**

- `out` (Float32Array)

**Returns**

- `void`

<MemberHeading id="settransform" depth="3" name="setTransform" sig="setTransform(matrix: Matrix4): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/webgl-ts/#L50" sourceLabel="webgl.ts:50" />

_Implementation of&#x20;_[`setTransform`](/keyframe-flow/docs/rendertarget#settransform)

Receives the evaluated transform as a canonical `Matrix4` (§17.1).

**Parameters**

- `matrix` ([Matrix4](/keyframe-flow/docs/matrix4))

**Returns**

- `void`
