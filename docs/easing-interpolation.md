---
title: Easing & Interpolation
group: Guides
order: 3
---

# Easing & Interpolation

Easing controls _when_ values arrive; interpolation controls _how_ they move
between keyframes. Both are chosen at definition time and evaluated
deterministically (§8, §9).

## Named easings

Twenty-six built-ins cover the common curves — `linear`, the CSS keyword
family (`ease`, `ease-in`, `ease-out`, `ease-in-out`), and sine/quad/cubic/
quart/quint/expo/circ in each of `in` / `out` / `in-out`:

```ts
Animation.from({
  from: transform(),
  to: transform().translate(200, 0),
  duration: 500,
  easing: "ease-out-quart",
});
```

> [!TIP]
> Names are validated eagerly — an unknown easing name throws at
> `Animation.from()`, not during playback.

The gallery below plots the progress curve of one named easing; pick any of the
26 with the **easing** control:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=easing-easing-gallery--curves title="Live demo — easing curve gallery" height=380 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/easing-easing-gallery--curves)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/easing-easing-gallery--curves)
to switch between all 26 curves.

## Custom easings

Any `(progress: number) => number` function works with no registration step
(§8). Inputs and outputs are normalized progress in `[0, 1]`; the function
must return finite numbers (non-finite results throw at sampling time):

```ts
const overshoot = (t: number): number => {
  const c = 1.70158;
  const u = t - 1;
  return u * u * ((c + 1) * u + c) + 1; // easeOutBack
};

const from = transform();
const to = transform().translate(200, 0);

Animation.from({ from, to, duration: 400, easing: overshoot });
```

## Per-keyframe segment easing

The animation-level `easing` is the **default**. A keyframe may carry its own
`easing`, which then controls interpolation _from that keyframe to the next_
(§8):

```ts
Animation.from({
  duration: 1000,
  easing: "linear", // default for segments without an override
  keyframes: [
    { at: 0, transform: start },
    { at: 0.5, transform: mid, easing: "ease-out-cubic" }, // eases into `end`
    { at: 1, transform: end },
  ],
});
```

## Interpolation model

Between two keyframes, each transform property interpolates by its own rule
(§9):

| Property | Rule                                |
| -------- | ----------------------------------- |
| Position | Linear component-wise               |
| Scale    | Linear component-wise               |
| Rotation | Quaternion **SLERP**, shortest path |

Shortest-path SLERP is the right default for orientations — but it means a
rotation from `0` to `2π` animates _nothing_, because both endpoints are the
same orientation. That is where angular tracks come in.

## Angular rotation tracks (full revolutions)

Set `rotationMode: "angular"` to interpolate authored Euler angles
component-wise instead of collapsing to orientations (§9.1). A segment from
`0` to `2π` now performs one full revolution — no intermediate keyframes:

```ts
const spin = Animation.from({
  from: { rotation: [0, 0, 0] },
  to: { rotation: [0, Math.PI * 2, 0] }, // a full turn about Y
  duration: 1000,
  rotationMode: "angular",
});

// At t = 500 ms the object is half-way through the turn — upside-down from
// its start heading, not silently still.
spin.sample(500);
```

Angles are captured verbatim when you author `rotation` as an `[x, y, z]`
tuple; quaternion-authored values are decomposed to principal angles instead.
A single quaternion cannot express "how many turns", which is exactly the
information angular tracks preserve.

The demo below runs SLERP (collapses to nothing) and angular (a real full turn)
side by side so the difference is visible:

```iframe
//johnsonjo4531.github.io/keyframe-flow/storybook/iframe.html?id=interpolation-slerp-vs-angular--full-revolution title="Live demo — SLERP vs angular full revolution" height=520 themed=false

```

[▶ Vanilla TypeScript implementation](https://johnsonjo4531.github.io/keyframe-flow/examples/#/example/interpolation-slerp-vs-angular--full-revolution)

[Open in Storybook](https://johnsonjo4531.github.io/keyframe-flow/storybook/?path=/story/interpolation-slerp-vs-angular--full-revolution)
for the two definitions.

## Raw matrix interpolation

For advanced hosts, `interpolation: "raw-matrix"` switches sampling to
explicit element-wise `Matrix4.lerp` of endpoint matrices (§9.2). It matches
property-aware interpolation for translation-only motion, and throws loudly —
never approximates — when a midpoint is not TRS-decomposable (interpolating
between different-axis rotations produces shear):

```ts
const raw = Animation.from({
  from,
  to,
  duration: 300,
  interpolation: "raw-matrix", // explicit opt-in; default remains "trs"
});
```

`rotationMode: "angular"` and `interpolation: "raw-matrix"` conflict (raw
matrices never consult rotation tracks) — the combination throws at definition
time.

## See also

- [Core concepts](../core-concepts/#euler-angles-are-intrinsic-x--y--z-in-radians)
- Live easing gallery and interpolation comparisons in the
  [Storybook examples](../../storybook/).
