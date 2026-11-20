---
title: HtmlTargetOptions
kind: interface
longname: HtmlTargetOptions
description: Options for html .
---

# HtmlTargetOptions

<Signature
  code="interface HtmlTargetOptions {
	transformOrigin?: string;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/html-ts/#L23" label="html.ts:23" />

Options for `html`.

---

## Properties

<MemberHeading id="transformorigin" depth="3" name="transformOrigin" sig="transformOrigin: string" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/targets/html-ts/#L30" sourceLabel="html.ts:30" />

Optional `transform-origin` to apply once when the adapter is created. When omitted the element keeps whatever origin CSS already gives it — usually `50% 50%`. Because the library's matrices are origin-agnostic, set an explicit origin (e.g. `"0 0"`) when matching other renderers.
