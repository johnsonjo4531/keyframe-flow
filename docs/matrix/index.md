---
title: matrix
kind: variable
longname: matrix
description: Portable matrix entry points (§15). const a = matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 0, 0, 1]); const b = matrix.from(domMatrix); const result = a.multiply(b);
---

# matrix

<Signature
  code="matrix: {
	DOMMatrixConstructor: (() => DOMMatrixWritable) | undefined;
	from;
	fromDOMMatrix;
	fromTRS;
	identity;
}"
/>

<SourceLink href="/keyframe-flow/docs/source/matrix/index-ts/#L31" label="index.ts:31" />

Portable matrix entry points (§15).

```ts
const a = matrix.from([1, 0, 0, 0, 0, 1, 0, 0, 0, 0, 1, 0, 10, 0, 0, 1]);
const b = matrix.from(domMatrix);
const result = a.multiply(b);
```

**Properties**

- `DOMMatrixConstructor` ((() => [DOMMatrixWritable](/keyframe-flow/docs/dommatrixwritable)) | undefined)
- `from`
- `fromDOMMatrix`
- `fromTRS`
- `identity`
