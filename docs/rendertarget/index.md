---
title: RenderTarget
kind: interface
longname: RenderTarget
description: The structural render target interface (§17.1). Any object with a setTransform method is a valid target — custom rendering systems do not need to inherit from a library class or import anything from it. The engine owns playback state; the target owns rendering-specific state only (§17.2). Adapters translate evaluated transforms into rendering-system-specific operations and never own animation time or playback lifecycle (§3.6). Disposing a playback must not destroy the underlying DOM element, canvas context, or graphics resource — targets are not owned resources (Appendix B.8) — so dispose is optional and reserved for adapter-owned bookkeeping only.
---

# RenderTarget

<Signature
  code="interface RenderTarget {
	dispose?(): void;
	setTransform(matrix: Matrix4): void;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/types-ts/#L27" label="types.ts:27" />

The structural render target interface (§17.1). Any object with a `setTransform` method is a valid target — custom rendering systems do not need to inherit from a library class or import anything from it.

The engine owns playback state; the target owns rendering-specific state only (§17.2). Adapters translate evaluated transforms into rendering-system-specific operations and never own animation time or playback lifecycle (§3.6). Disposing a playback must not destroy the underlying DOM element, canvas context, or graphics resource — targets are not owned resources (Appendix B.8) — so `dispose` is optional and reserved for adapter-owned bookkeeping only.

**Example**

```ts
const recorder: RenderTarget = {
  matrices: [] as Matrix4[],
  setTransform(matrix: Matrix4) {
    this.matrices.push(matrix);
  },
};
animation.attach(recorder).play();
```

#### Implemented By

- [`WebGLRenderTarget`](/keyframe-flow/docs/webglrendertarget)
- [`WebGPURenderTarget`](/keyframe-flow/docs/webgpurendertarget)

---

## Methods

<MemberHeading id="dispose" depth="3" name="dispose" sig="dispose(): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/types-ts/#L31" sourceLabel="types.ts:31" />

Optional cleanup of adapter-owned state; never destroys host resources.

**Returns**

- `void`

<MemberHeading id="settransform" depth="3" name="setTransform" sig="setTransform(matrix: Matrix4): void" />

<MemberMeta sourceHref="/keyframe-flow/docs/source/targets/types-ts/#L29" sourceLabel="types.ts:29" />

Receives the evaluated transform as a canonical `Matrix4` (§17.1).

**Parameters**

- `matrix` ([Matrix4](/keyframe-flow/docs/matrix4))

**Returns**

- `void`
