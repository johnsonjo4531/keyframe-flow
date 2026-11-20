---
title: target
kind: variable
longname: target
description: "Built-in render target factories (§17). spin.attach(target.html(element)).play(); spin.attach(target.svg(gElement)).play(); spin.attach(target.canvas(ctx2d)).play(); spin.attach(target.webgl({ onTransform: uploadAndDraw })).play(); Custom rendering systems skip this namespace entirely: any object with a setTransform(matrix) method is a valid target (§17.1)."
---

# target

<Signature
  code="target: {
	canvas: (context: CanvasRenderingContext2DLike, options?: Canvas2DTargetOptions) => RenderTarget;
	html: (element: CssTransformElementLike, options?: HtmlTargetOptions) => RenderTarget;
	svg: (element: SvgTransformElementLike) => RenderTarget;
	webgl: (options?: WebGLRenderTargetOptions) => WebGLRenderTarget;
	webgpu: (options?: WebGPURenderTargetOptions) => WebGPURenderTarget;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/index-ts/#L25" label="index.ts:25" />

Built-in render target factories (§17).

```ts
spin.attach(target.html(element)).play();
spin.attach(target.svg(gElement)).play();
spin.attach(target.canvas(ctx2d)).play();
spin.attach(target.webgl({ onTransform: uploadAndDraw })).play();
```

Custom rendering systems skip this namespace entirely: any object with a `setTransform(matrix)` method is a valid target (§17.1).

**Properties**

- `canvas` ((context: [CanvasRenderingContext2DLike](/keyframe-flow/docs/canvasrenderingcontext2dlike), options?: [Canvas2DTargetOptions](/keyframe-flow/docs/canvas2dtargetoptions)) => [RenderTarget](/keyframe-flow/docs/rendertarget)) — `canvas` — Canvas 2D CTM adapter with explicit projection (§17.3).
- `html` ((element: [CssTransformElementLike](/keyframe-flow/docs/csstransformelementlike), options?: [HtmlTargetOptions](/keyframe-flow/docs/htmltargetoptions)) => [RenderTarget](/keyframe-flow/docs/rendertarget)) — `html` — CSS `matrix3d()` transform adapter for HTML elements (§17).
- `svg` ((element: [SvgTransformElementLike](/keyframe-flow/docs/svgtransformelementlike)) => [RenderTarget](/keyframe-flow/docs/rendertarget)) — `svg` — SVG 1.1 `matrix()` transform attribute adapter (§17).
- `webgl` ((options?: [WebGLRenderTargetOptions](/keyframe-flow/docs/webglrendertargetoptions)) => [WebGLRenderTarget](/keyframe-flow/docs/webglrendertarget)) — `webgl` — column-major matrix upload adapter for WebGL hosts (§3.6).
- `webgpu` ((options?: [WebGPURenderTargetOptions](/keyframe-flow/docs/webgpurendertargetoptions)) => [WebGPURenderTarget](/keyframe-flow/docs/webgpurendertarget)) — `webgpu` — column-major matrix upload adapter for WebGPU hosts (§3.6).
