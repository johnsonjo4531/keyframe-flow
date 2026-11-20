---
title: CssTransformElementLike
kind: interface
longname: CssTransformElementLike
description: The structural subset of an HTML element the adapter needs — any element with a CSS style.transform string works, and no DOM lib types are referenced so the core stays browser-API-free at import time (§2 principle 1).
---

# CssTransformElementLike

<Signature
  code="interface CssTransformElementLike {
	style: { transform: string; transformOrigin?: string };
}"
/>

<SourceLink href="/keyframe-flow/docs/source/targets/html-ts/#L9" label="html.ts:9" />

The structural subset of an HTML element the adapter needs — any element with a CSS `style.transform` string works, and no DOM lib types are referenced so the core stays browser-API-free at import time (§2 principle 1).

---

## Properties

<MemberHeading id="style" depth="3" name="style" sig="style: { transform: string; transformOrigin?: string }" />

<MemberMeta badges="readonly" sourceHref="/keyframe-flow/docs/source/targets/html-ts/#L14" sourceLabel="html.ts:14" />

Inline style bag the adapter writes to. `transformOrigin` is optional — only touched when explicitly requested (§17.3).

**Properties**

- `transform` (string) — CSS `transform` property value; fully owned by the adapter (§17.3).
- `transformOrigin` (string, optional) — CSS `transform-origin` property value, when supported (§17.3).
