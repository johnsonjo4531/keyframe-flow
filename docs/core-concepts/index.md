---
title: Core Concepts & Coordinate Conventions
kind: guide
group: Guides
order: 1
---

# Core Concepts & Coordinate Conventions

keyframe-flow's value comes from stating one coordinate convention and never breaking it. This page is the contract (§4, §15); violations are impossible rather than merely discouraged, because every operation that could introduce ambiguity throws explicitly.

## One convention, stated in full

| Aspect          | Choice                                             |
| --------------- | -------------------------------------------------- |
| Handedness      | Right-handed                                       |
| Vectors         | Column vectors — matrices act as `M · v`           |
| Euler order     | Intrinsic `X → Y → Z`, radians only                |
| TRS composition | `M = T × R × S` (scale applied first to the point) |
| Matrix storage  | Column-major (`Float64Array[16]`)                  |
| Angle units     | Radians everywhere — degrees are never accepted    |

Because this is fixed, two transforms produced by different parts of your codebase always compose correctly, and matrices can cross the browser/Node boundary without silent reinterpretation.

## Right-handedness and column vectors

Vectors are columns; a matrix maps them by left-multiplication: `v' = M · v`. The three basis images live in the first three columns of `M`:

```ts
import { matrix, Quaternion } from "keyframe-flow";

const m = matrix.fromTRS({
  position: [10, 20, 30],
  rotation: Quaternion.identity(),
});
// Column-major storage: translation lives at indices 12–14 (§15).
m.el(12); // 10 — the x translation
```

This layout is exactly what WebGL's `gl.uniformMatrix4fv` and WGSL's `mat4x4<f32>` consume, and it maps onto CSS/DOMMatrix without transposition.

## Euler angles are intrinsic X → Y → Z, in radians

```ts
import { Quaternion } from "keyframe-flow";

// Equivalent to Rx · Ry · Rz — applied right-to-left to a point:
// first roll about Z, then pitch about Y, then yaw about X.
const q = Quaternion.fromEuler(xAngle, yAngle, zAngle);
```

Degrees are rejected structurally: there is no API surface that accepts them, so a degrees/radians mix-up cannot occur silently (§4.3).

## Composition order — the rule that prevents 90% of bugs

Transform composition follows the parent-to-child reading `M_world = M_parent × M_local` (§4.4). The fluent API applies operations as **local-space** operations in call order, i.e. each call does `M ← M × Op`:

```ts
import { transform } from "keyframe-flow";

// Translate first, THEN rotate — the rotation happens about the object's
// (now displaced) local origin, like a crane arm swinging after extending.
const crane = transform()
  .translate(100, 0)
  .rotateZ(Math.PI / 2);

// Rotating before translating orbits the original origin instead.
const orbit = transform()
  .rotateZ(Math.PI / 2)
  .translate(100, 0);
```

The demo below runs both snippets from above side by side: each box animates from identity to its composed result, so where they end up shows exactly how the call order changes the product `M = T × R × S`.

<Embed src="//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=guides-core-concepts--crane-vs-orbit" title="Live demo — crane vs orbit: the same operations, opposite order" height="380" themed="false" />

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/guides-core-concepts--crane-vs-orbit)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/guides-core-concepts--crane-vs-orbit) for the two definitions side by side with explanations.

For operations expressed in the parent (world) frame, use the `world*` variants — `worldTranslate`, `worldRotateX/Y/Z`, `worldRotate` — which apply in the parent frame rather than the local one.

## Immutability everywhere

Every operation returns a new value; nothing mutates in place (§4.2). Transforms are frozen, so shared definitions can be handed to any number of playbacks without defensive copies or aliasing surprises. Negative scale is rejected at construction — mirror geometry is expressed with rotation or an explicit matrix instead, keeping decompositions unambiguous.

## Explicit throws over silent approximations

Decomposition (matrix → position/rotation/scale) only succeeds for matrices that are TRS-decomposable. Unsupported inputs throw rather than guessing:

- shear
- reflection (negative determinant scale)
- perspective rows
- singular matrices (§9.2, §15.1)

The same philosophy governs interpolation: raw element-wise matrix averaging is never the default, and opting into it ([Easing & interpolation](../easing-interpolation/#raw-matrix-interpolation)) still throws when a midpoint is not decomposable.

## Native matrix interop

Conversions to and from platform matrices preserve **mathematical meaning**, not raw element order (§15.2). `DOMMatrix` named members follow the CSSOM `m<column><row>` convention, which aligns with column-major storage:

```ts
const mine = Matrix4.fromDOMMatrix(native); // reads m11…m44 by name
const back = mine.toDOMMatrix(); // native DOMMatrix when available
```

The core itself imports nothing browser-specific — `Matrix4.fromDOMMatrix` accepts any object with the named members, structurally (§2 principle 1).

## See also

- API reference: [`Transform`](../transform/), [`Matrix4`](../matrix4/), [`Quaternion`](../quaternion/)
- [Animation authoring](../animation-authoring/) — building on these types
- [Render adapters](../render-adapters/) — how the conventions surface in CSS, SVG, and GPU upload paths
