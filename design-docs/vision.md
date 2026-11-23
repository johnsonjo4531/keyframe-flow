# Cross-Platform Transform & Animation Library

**Status:** Final design specification  
**Version:** 0.0.0  
**Language:** TypeScript-first

## 1. Overview

The library provides a platform-independent system for constructing, composing, animating, and rendering 2D and 3D transformations.

It is designed to support multiple animation-authoring styles, including declarative definitions, static keyframes, and synchronous generators.

The architecture separates animation definitions, playback, transforms, matrices, scheduling, and rendering adapters. This allows the core animation system to operate independently of browser APIs and integrate with different rendering environments.

### Primary goals

- Construct and compose 2D and 3D transforms.
- Define reusable animations declaratively or programmatically.
- Generate keyframes using synchronous iterables and generators.
- Create independent playback instances from immutable animation definitions.
- Support both automatic playback and manual sampling.
- Interoperate with native matrix implementations.
- Integrate with different rendering systems through minimal structural interfaces.
- Provide predictable and deterministic animation behavior.

## 2. Core design principles

1. **Platform independence:** The animation and transform cores must not depend on browser APIs.
2. **Separation of concerns:** Definitions, playback, transforms, matrices, scheduling, and rendering remain independent.
3. **Immutable definitions:** Animation definitions and public transform values are immutable and reusable.
4. **Independent playback:** Every playback instance maintains its own execution state and lifecycle.
5. **Multiple authoring styles:** Animations can be defined through from/to values, static keyframes, or synchronous generators.
6. **Explicit time semantics:** Durations use milliseconds; keyframe positions use normalized progress.
7. **Predictable interpolation:** Transform properties use appropriate mathematical interpolation rather than arbitrary matrix interpolation.
8. **Extensibility:** Custom matrix interoperability, clocks, schedulers, and render targets are supported.
9. **Performance:** Mutable internal representations are permitted to minimize allocations and rendering work.

## 3. Architecture

The library is organized into six conceptual subsystems.

### 3.1 Animation Core

Responsible for:

- Immutable animation definitions.
- Keyframes and property tracks.
- Easing functions.
- Property-specific interpolation.
- Animation evaluation and sampling.
- Keyframe normalization and validation.

The animation core has no dependency on playback scheduling or rendering platforms.

### 3.2 Playback Engine

Responsible for:

- Creating independent playback instances.
- Tracking playback state and current time.
- Play, pause, resume, reverse, seek, and cancellation.
- Playback rates and repetition.
- Completion promises.
- Managing target ownership and replacement behavior.

### 3.3 Transform Core

Responsible for:

- Position.
- Rotation.
- Scale.
- Transform composition.
- Local-space and world-space operations.
- Conversion between transform components and matrices.

Public transforms are immutable component-based values. The canonical representation uses position, quaternion rotation, and scale.

### 3.4 Matrix Implementation

Responsible for:

- Portable Matrix4 implementation.
- Multiplication and inversion.
- Matrix composition.
- Transform decomposition and recomposition.
- Conversion to and from native matrix representations.

The portable matrix implementation is the canonical matrix representation. Native matrices are supported through conversion rather than requiring interchangeable internal backends.

### 3.5 Scheduling

Responsible for:

- Centralized playback updates.
- Time progression.
- Clock integration.
- Scheduling and cancellation of update callbacks.
- Coordinating multiple active playback instances.

The scheduler is independent of the animation core.

### 3.6 Render Adapters

Responsible for translating evaluated transforms into rendering-system-specific operations.

Initial targets:

- HTML DOM.
- SVG.
- Canvas 2D.
- Custom rendering systems.

Future targets:

- WebGL.
- WebGPU.

Adapters do not own animation time or playback lifecycle.

### 3.7 Timeline Composition (Future)

A future Timeline subsystem coordinates multiple independently defined animations over a shared time axis.

Responsible for:

- Scheduling animation definitions at independent start times.
- Coordinating animations with different durations.
- Sequencing and parallel composition.
- Nested timeline composition.
- Repeating individual scheduled segments or complete timelines.
- Staggering groups of animations.
- Evaluating child definitions at their local timeline times.

A Timeline is a composition definition, not a replacement for Animation or Playback.

The intended conceptual boundaries are:

- `Animation` defines motion for one animated value or transform.
- `Timeline` defines when multiple animation or timeline definitions run.
- `Playback` executes an animation or timeline definition and owns its transport and lifecycle.
- `RenderTarget` receives evaluated output and remains responsible for rendering.

A Timeline must remain platform-independent and deterministic. It must not depend on DOM elements, browser timers, or a specific rendering adapter.

## 4. Transform API

### 4.1 Construction

The primary transform API is fluent:

```ts
const position = transform()
  .translate(100, 50, 0)
  .rotateY(Math.PI / 2)
  .scale(2);
```

A declarative alternative is also available:

```ts
const position = transform({
  position: [100, 50, 0],
  rotation: [0, Math.PI / 2, 0],
  scale: [2, 2, 2],
});
```

### 4.2 Immutability

Transforms are immutable public values.

Every operation returns a new transform without modifying its source.

Mutable internal representations are permitted for performance.

A separate public mutable builder API is not included initially.

### 4.3 Transform representation

The canonical component representation consists of:

```ts
interface TransformComponents {
  position: Vector3;
  rotation: Quaternion;
  scale: Vector3;
}
```

Euler angles are accepted as a convenient construction interface, using radians, but rotations are represented internally using quaternions.

Matrices are generated from these components when required.

Transforms that cannot be represented as ordinary TRS components must use an explicit matrix representation rather than being silently approximated.

### 4.4 Coordinate conventions

The library uses:

- Right-handed coordinate system.
- Column vectors.
- Column-major matrix storage.
- Radians for angular values.
- Unitless distances and scales.
- Parent-to-child composition using `Parent × Local`.

Matrix multiplication follows conventional mathematical notation:

```ts
const result = a.multiply(b); // A × B
```

Fluent transform operations are applied in call order using local-space operations.

For example:

```ts
transform()
  .translate(100, 0, 0)
  .rotateY(Math.PI / 2);
```

The resulting transform represents a rotated local object positioned at the translated location.

World-space operations, when supported, operate in the parent coordinate system rather than the object's local coordinate system.

## 5. Animation Definitions

### 5.1 Construction

All animations are created using:

```ts
Animation.from(definition);
```

Animation definitions are immutable and reusable.

Three authoring styles are supported.

### 5.2 From/to definitions

```ts
const spin = Animation.from({
  from: transform(),
  to: transform().rotateY(Math.PI * 2),
  duration: 2000,
  easing: "ease-in-out",
});
```

Both starting and ending values are explicitly defined in the initial API.

Automatic capture of a target's current transform is deferred.

### 5.3 Static keyframes

```ts
const bounce = Animation.from({
  keyframes: [
    { at: 0, transform: transform() },
    {
      at: 0.5,
      transform: transform().translate(0, 100, 0),
    },
    { at: 1, transform: transform() },
  ],
  duration: 1000,
});
```

### 5.4 Generator-produced keyframes

Synchronous iterables and generators provide an alternative way to author keyframe sequences.

```ts
function* generateKeyframes() {
  for (let i = 0; i <= 100; i++) {
    const progress = i / 100;

    yield {
      at: progress,
      transform: transform().translate(
        Math.cos(progress * Math.PI * 2) * 100,
        Math.sin(progress * Math.PI * 2) * 100,
        0,
      ),
    };
  }
}

const orbit = Animation.from({
  keyframes: generateKeyframes,
  duration: 3000,
});
```

Supported sources:

- Arrays.
- Synchronous iterables.
- Generator instances.
- Functions returning synchronous iterables.

Generators are authoring mechanisms, not playback mechanisms.

### 5.5 Generator evaluation

All iterable sources are eagerly consumed and normalized when `Animation.from()` is called.

This means:

- Generator functions execute once per animation definition.
- Generator instances are consumed immediately.
- Playback instances share the resulting normalized timeline.
- Generator side effects cannot cause different playback results.
- Animation definitions do not retain generator execution state.

Async iterables and async generators are explicitly excluded from the initial API.

## 6. Keyframe Representation and Time Semantics

### 6.1 Keyframe representation

```ts
interface Keyframe<T> {
  at: number;
  value: T;
}
```

Transform keyframes:

```ts
interface TransformKeyframe {
  at: number;
  transform: Transform;
  easing?: Easing;
}
```

The `at` property represents normalized progress from `0` to `1`.

### 6.2 Duration

Animation duration is always expressed in milliseconds.

```ts
Animation.from({
  keyframes: [...],
  duration: 2000,
});
```

Keyframe timestamps remain independent of duration.

Changing the duration does not require changing keyframe positions.

### 6.3 Validation

Keyframe positions must:

- Be finite numbers.
- Be within the inclusive range `[0, 1]`.
- Be strictly increasing.
- Never contain duplicate timestamps.

Additional behavior:

| Condition                | Behavior                                  |
| ------------------------ | ----------------------------------------- |
| Empty keyframes          | Throw an error                            |
| One keyframe             | Constant animation                        |
| Missing initial keyframe | Hold the first value before its timestamp |
| Missing final keyframe   | Hold the last value after its timestamp   |
| Out-of-order timestamps  | Throw an error                            |
| Duplicate timestamps     | Throw an error                            |
| Invalid timestamps       | Throw an error                            |

Keyframes are never silently reordered.

## 7. Property-Level Animation

The library supports both complete transform animation and property-level animation.

Example:

```ts
Animation.from({
  from: {
    position: [0, 0, 0],
    rotation: [0, 0, 0],
  },
  to: {
    position: [100, 0, 0],
    rotation: [0, Math.PI, 0],
  },
  duration: 1000,
});
```

Property-level definitions are normalized into the same underlying transform representation.

Unspecified properties are preserved from the explicitly supplied starting transform. When no starting transform is supplied, their documented identity defaults are used.

The initial API does not require developers to use separate `Animation.to()` and `Animation.by()` construction methods.

## 8. Easing

Easing is supported at both animation and keyframe levels.

```ts
Animation.from({
  keyframes: [
    {
      at: 0,
      transform: transform(),
    },
    {
      at: 0.5,
      transform: transform().translate(100, 0),
      easing: "ease-in",
    },
    {
      at: 1,
      transform: transform().translate(100, 100),
      easing: "ease-out",
    },
  ],
  duration: 2000,
  easing: "linear",
});
```

The animation-level easing provides the default.

A keyframe's easing controls the interpolation from that keyframe to the next.

Custom easing functions are supported:

```ts
type EasingFunction = (progress: number) => number;
```

Built-in named easing functions should include common linear, ease-in, ease-out, and ease-in-out variants.

Custom easing functions do not require global registration.

## 9. Interpolation

Interpolation must be property-aware.

Raw element-wise interpolation of 4×4 matrices is not the default.

Initial interpolation behavior:

| Property         | Interpolation                   |
| ---------------- | ------------------------------- |
| Translation      | Linear interpolation            |
| Scale            | Linear interpolation            |
| 3D rotation      | Quaternion SLERP                |
| 2D rotation      | Angular interpolation           |
| Other properties | Property-specific interpolation |

### 9.1 Rotation

- Public Euler angles use radians.
- Internal 3D rotations use quaternions.
- Quaternion interpolation uses SLERP.
- Quaternion values are normalized when necessary.
- Shortest-path rotation is the default.

Full revolutions require intermediate keyframes in the initial API because equivalent starting and ending orientations do not inherently describe a full revolution.

Advanced angular rotation tracks may be introduced later.

### 9.2 Matrix interpolation

Raw matrix interpolation may be available as an explicit advanced option, but it is not the default transform interpolation strategy.

Transforms containing shear, reflection, perspective, or singular components may not be decomposable into ordinary TRS components.

The library must not silently approximate unsupported decompositions.

## 10. Manual Sampling

Manual sampling is a first-class feature and does not require playback or a render target.

Two explicit sampling methods are provided.

### 10.1 Time-based sampling

```ts
const value = animation.sample(500);
```

The input is elapsed milliseconds.

### 10.2 Progress-based sampling

```ts
const value = animation.sampleProgress(0.25);
```

The input is normalized progress between `0` and `1`.

Both methods evaluate the same underlying timeline.

For an animation with a duration of 2000 milliseconds, sampling at 500 milliseconds and sampling at 25% progress produce equivalent results.

No implicit unit detection or overloaded numeric arguments are permitted.

Out-of-range sampling values are clamped to the animation boundaries.

### 10.3 External rendering

This makes it possible to integrate the library directly into external rendering loops.

```ts
function renderFrame(time: number) {
  const currentTransform = animation.sample(time);

  renderer.draw(currentTransform);
}
```

Manual sampling does not mutate the animation definition or require a scheduler.

## 11. Playback Instances

Animation definitions create independent playback instances through `attach()`.

```ts
const playback = spin.attach(target.html(element));

playback.play();
```

Attachment may also be target-independent:

```ts
const playback = spin.attach();
```

This permits independent time control and playback lifecycle without requiring a built-in rendering target.

Manual sampling directly from the animation definition remains the preferred approach for external rendering systems that already own their time progression.

### 11.1 Playback interface

```ts
interface Playback {
  readonly state: PlaybackState;
  readonly currentTime: number;
  readonly finished: Promise<PlaybackResult>;

  playbackRate: number;

  play(): void;
  pause(): void;
  reverse(): void;

  seek(timeMs: number): void;
  seekProgress(progress: number): void;

  cancel(): void;
  dispose(): void;
}
```

The completion promise resolves with:

```ts
type PlaybackResult = { status: "finished" } | { status: "cancelled" };
```

The promise resolves rather than rejects for ordinary cancellation.

Each playback run has its own completion promise.

## 12. Playback Lifecycle

Initial states:

- Idle.
- Running.
- Paused.
- Finished.
- Cancelled.
- Disposed.

Defined behavior:

| Operation        | Behavior                                               |
| ---------------- | ------------------------------------------------------ |
| `play()`         | Starts or resumes playback                             |
| `pause()`        | Stops time advancement while retaining state           |
| `reverse()`      | Changes playback direction                             |
| `seek()`         | Changes elapsed animation time                         |
| `seekProgress()` | Changes normalized animation progress                  |
| `cancel()`       | Stops playback and retains the last rendered transform |
| `dispose()`      | Permanently releases playback resources                |

Additional rules:

- Calling `play()` on a finished playback restarts it from the beginning in its current direction.
- Pausing does not reset playback time.
- Playback-rate changes do not introduce time discontinuities.
- Cancellation and completion are separate outcomes.
- Disposing is idempotent.
- Operations on disposed playback instances throw errors.

Cancellation does not attempt to restore an unknown original target transform. This avoids requiring every render target to implement transform reading or state capture.

## 13. Repetition and Direction

Playback supports:

- Single execution.
- Finite repetition.
- Infinite repetition.
- Reverse playback.
- Alternate playback direction.

Finite iteration counts represent the total number of iterations, including the initial iteration.

Infinite playback does not naturally complete.

Alternate playback reverses direction between iterations.

Repetition is handled by the playback engine rather than by duplicating animation definitions or keyframes.

### 13.1 Repetition Semantics (Clarification and Future API)

The existing repetition capability should use consistent semantics for both Animation and future Timeline definitions.

- `iterations` means the total number of iterations, including the first.
- `iterations: 1` means one execution.
- Finite iteration counts must be positive integers.
- Infinite repetition is represented explicitly, such as `Infinity`, and does not naturally complete.
- `direction: "normal"` plays each iteration forward.
- `direction: "alternate"` reverses direction on alternating iterations.
- A repeat delay is the gap between iterations; it does not delay the first iteration.
- An optional start delay, if provided, is distinct from repeat delay.

Normal repetition restarts each iteration from the definition's authored beginning. Alternate repetition reverses progress and does not snap to the beginning between alternating iterations.

Relative accumulation (for example, adding another 360 degrees to a rotation on every iteration) is deferred. Repeated animations do not accumulate values by default.

Playback repetition remains an execution-level convenience. Timeline repetition is a compositional operation described in the Timeline API addendum.

## 14. Concurrent Animations and Composition

The initial release uses replacement semantics for conflicting animations.

Rules:

- One active transform-producing playback owns a target at a time.
- Starting another playback on that target supersedes the existing playback.
- No implicit additive composition occurs.
- Animations affecting the same target do not automatically merge their values.

The architecture should eventually support property-level composition so independent animations can affect different properties simultaneously.

For example, movement and rotation should eventually be composable without manually authoring a combined animation.

A future composition API could provide:

```ts
const animation = Animation.combine([move, rotate, scale]);
```

Property tracks are the preferred underlying composition model. A convenience combination API can be provided on top of that model.

Full animation groups and nested timelines are not part of the initial release.

### 14.1 Timeline Composition (Future)

Full multi-animation orchestration is a future capability and does not change the initial `Animation.group()` or `Animation.combine()` semantics.

A Timeline should support the following composition forms:

- **At / absolute placement:** place a child at a specific timeline time in milliseconds.
- **Sequence:** place children consecutively, optionally with a gap.
- **Parallel:** place children at the same timeline start, allowing their individual durations to differ.
- **Nested timelines:** use a timeline as a child of another timeline.
- **Stagger:** expand a collection of children into scheduled entries with a configurable start interval and ordering.

The intended API shape is illustrative, not a final public signature:

```ts
const scene = Timeline.from({
  heading: { animation: headingIn, target: headingElement, at: 0 },
  subtitle: { animation: subtitleIn, target: subtitleElement, at: 200 },
  card: { animation: cardIn, target: cardElement, at: 450 },
});

const entrance = Timeline.sequence([
  logoIn,
  headerTimeline,
  Timeline.stagger(cardIn, cardElements, { delay: 100 }),
]);
```

Each child retains its own intrinsic animation duration. Timeline placement determines its start time; it does not silently normalize all children to a common duration.

Absolute placement and relative sequence placement serve different authoring needs. The API may support both, but their units and ordering rules must remain explicit.

Timeline composition must not be implemented by changing `Animation.group()` into a target-aware scene API. Existing animation-level composition remains property-track composition.

### 14.2 Timeline Repetition (Future)

Repetition should be available at three levels:

1. **Playback repetition:** repeat the complete definition being played, whether it is an Animation or Timeline.
2. **Repeated timeline segment:** repeat one child animation or nested timeline within a larger timeline.
3. **Repeated choreography:** repeat an entire sequence or parallel composition as a single temporal unit.

The conceptual API may include:

```ts
const repeatedSequence = Timeline.repeat(sequence, {
  iterations: 3,
  delay: 500,
});

const scene = Timeline.parallel([
  Timeline.repeat(backgroundSpin, { iterations: Infinity }),
  Timeline.repeat(buttonPulse, {
    iterations: 3,
    direction: "alternate",
  }),
  headingIn,
]);
```

These examples illustrate desired semantics and are not finalized signatures.

A repeated segment should be represented compactly as a repeat operation, not eagerly expanded into a separate entry for every iteration. This is especially important for infinite repetition and large finite iteration counts.

The same repeat options should be used wherever practical: total iteration count, direction, and repeat delay. Repeating a Timeline must preserve the timing relationships among its children.

### 14.3 Timeline Duration and Infinite Children (Future)

A finite Timeline should expose a determinable duration based on its scheduled children.

- Parallel composition ends when its longest finite child ends.
- Sequence composition places each child after the preceding child's duration and any configured gap.
- Absolute placement contributes the child's start offset plus its duration.
- A finite repeated segment contributes its repeated duration and inter-iteration delays.
- A Timeline containing an infinite parallel child has infinite duration.
- An infinite child in a sequence makes later children unreachable; this must be rejected or reported explicitly rather than silently accepted as useful choreography.

For a child with duration `D`, total iteration count `N`, and repeat delay `R`, finite repeated duration is:

`D * N + R * (N - 1)`

The repeat delay is omitted after the final iteration.

Timeline duration calculation must not require executing a generator during playback or sampling every frame.

### 14.4 Timeline Sampling and Target Conflicts (Future)

Timeline evaluation should be deterministic and sampleable at an absolute elapsed time, without requiring a scheduler.

At a given timeline time, each child is evaluated at its corresponding local time:

`childLocalTime = timelineTime - childStartTime`

A child before its start has not begun; a completed child follows the defined endpoint behavior of its underlying animation.

A Timeline may produce multiple evaluated outputs associated with different targets. Target attachment and rendering remain separate from the definition.

The initial composition model should retain replacement semantics for conflicting transform output. It must not imply automatic additive composition or property merging when two children affect the same target. Conflicts should be documented and, where feasible, detected or resolved by explicit ordering/ownership rules.

## 15. Matrix API

The library provides a portable matrix implementation.

Example:

```ts
const a = matrix.from(values);
const b = matrix.from(domMatrix);

const result = a.multiply(b);

const native = result.toDOMMatrix();
const gpuValues = result.toFloat32Array();
```

Matrix operations include:

- Creation.
- Multiplication.
- Inversion.
- Composition.
- Decomposition where supported.
- Conversion between representations.

### 15.1 Decomposition

Decomposition returns transform components when mathematically supported.

Unsupported matrices must fail explicitly rather than silently producing approximate TRS values.

Decomposition and recomposition are not guaranteed to reproduce every original matrix bit-for-bit because of floating-point precision and mathematical ambiguity.

### 15.2 Interoperability

Conversions must preserve mathematical meaning rather than simply copying matrix elements.

The implementation must account for:

- Row-major versus column-major storage.
- Multiplication conventions.
- Coordinate handedness.
- Precision.
- Translation placement.
- Native matrix semantics.

The portable implementation remains canonical. Custom matrix backends are not publicly injectable in the initial release.

## 16. Scheduling and Time Sources

The playback engine uses a centralized scheduler.

The clock and scheduler are separate injectable interfaces.

```ts
interface Clock {
  now(): number;
}

interface Scheduler {
  request(callback: (time: number) => void): unknown;
  cancel(handle: unknown): void;
}
```

The default browser implementation uses `requestAnimationFrame`.

Alternative implementations can integrate with:

- Node.js.
- Automated tests.
- Game loops.
- Custom rendering engines.
- Other scheduling environments.

The scheduler is responsible for:

1. Determining the current time.
2. Updating active playback instances.
3. Evaluating animation timelines.
4. Resolving playback repetition and direction.
5. Submitting resulting transforms to render targets.

Animation time is timestamp-based, never frame-count-based.

Playback-rate changes must preserve continuity relative to the current timestamp.

The scheduler should avoid unnecessary updates when no playback instances are active.

### 16.1 Timeline Playback and Shared Time (Future)

A Timeline should execute through the existing Playback and centralized scheduling architecture rather than introducing a separate animation clock for every child.

One Timeline Playback owns the shared transport:

- Play, pause, resume, seek, reverse, playback rate, cancellation, and disposal apply to the composed definition.
- Child animations derive their local time from the shared timeline time.
- Children may have different start times, durations, and repeat counts.
- The scheduler updates the composed playback as one scheduled unit while preserving independent child timing.

A user may still create independent Playbacks for individual animations when independent control is desired.

A Timeline's repeat behavior and a child's repeat behavior are composable. Repeating the outer Timeline repeats the complete choreography; repeating a child affects only that scheduled segment.

## 17. Render Targets

Built-in target factories:

```ts
target.html(element);
target.svg(element);
target.canvas(context);
```

Example:

```ts
spin.attach(target.html(element)).play();
```

### 17.1 Custom targets

Custom rendering systems use a structural interface:

```ts
interface RenderTarget {
  setTransform(matrix: Matrix4): void;
  dispose?(): void;
}
```

Custom targets do not need to inherit from a library class.

### 17.2 Responsibilities

The animation engine owns playback state.

The render target owns rendering-specific state.

The adapter handles:

- Matrix conversion.
- Coordinate-system conversion.
- Transform application.
- Rendering invalidation where applicable.
- Optional cleanup.

Disposing a playback must not automatically destroy the underlying DOM element, Canvas context, or graphics resource.

### 17.3 Rendering considerations

Adapters must define how they handle:

- Transform origins.
- Existing transforms.
- Coordinate systems.
- Matrix precision.
- Rendering invalidation.
- Target cleanup.

Canvas 2D is inherently a 2D affine rendering API. Supporting 3D transforms requires a projection step rather than directly forwarding a 4×4 matrix.

WebGL and WebGPU adapters are planned for future releases.

## 18. Package Architecture

The initial release uses a unified package with internal subsystem boundaries.

Potential internal organization:

```text
src/
  animation/
    definitions/
    keyframes/
    interpolation/
    easing/
    sampling/

  playback/
    instance/
    scheduler/
    lifecycle/

  transform/
    transform/
    components/
    composition/

  matrix/
    matrix4/
    operations/
    decomposition/
    conversion/

  targets/
    html/
    svg/
    canvas/
    custom/

  timing/
    clock/
    scheduler/
```

Potential public imports:

```ts
import { Animation, transform, matrix, target } from "library";
```

Optional subpath exports may be introduced for adapters and matrix utilities:

```ts
import { target } from "library/adapters/html";
import { matrix } from "library/matrix";
```

Publishing separate packages is deferred until actual dependency relationships and user demand justify it.

## 19. Non-Goals for the Initial Release

The initial release will not attempt to provide:

- Async-generator-driven animation definitions.
- A complete physics engine.
- A general-purpose simulation framework.
- Automatic synchronization with every external rendering engine.
- Arbitrary interpolation of every possible matrix.
- A complex animation composition graph.
- Automatic target-state capture.
- Automatic additive animation composition.
- Full animation groups and nested timelines.
- WebGL and WebGPU adapters.

These capabilities may be introduced as separate extensions or future releases.

### 19.1 Timeline and Choreography Non-Goals (Initial Release)

The initial release continues to defer full Timeline composition and nested animation groups as stated above.

The initial release does not require:

- A target-aware scene graph.
- Nested timelines.
- Absolute and relative child scheduling.
- Stagger helpers.
- Repeating timeline segments.
- Generator-authored choreography.
- Automatic additive composition across timeline children.

These are future capabilities. Their design should preserve the existing Animation, Playback, Scheduler, and RenderTarget boundaries rather than expanding the initial implementation scope.

## 20. Initial Implementation Milestones

### Milestone 1: Transform and Matrix Foundations

- Portable Matrix4 implementation.
- Matrix conversions.
- Immutable transform construction.
- Component-based transform representation.
- Transform composition.
- Transform decomposition where supported.
- Coordinate convention tests.

### Milestone 2: Animation Definitions

- From/to definitions.
- Static keyframes.
- Synchronous iterable support.
- Generator functions and instances.
- Eager keyframe normalization.
- Keyframe validation.
- Easing functions.
- Property-specific interpolation.
- Quaternion interpolation.
- Manual sampling by milliseconds and normalized progress.

### Milestone 3: Playback Engine

- Independent playback instances.
- Centralized scheduler.
- Injectable clock and scheduler.
- Play, pause, resume, seek, reverse, and cancel.
- Playback rates.
- Finite and infinite repetition.
- Alternate playback.
- Completion promises.
- Target replacement behavior.
- Disposal and lifecycle tests.

### Milestone 4: Render Adapters

- HTML.
- SVG.
- Canvas 2D.
- Custom structural targets.
- Adapter cleanup and ownership behavior.

### Milestone 5: Advanced Capabilities

- WebGL.
- WebGPU.
- Property-level animation composition.
- Advanced rotation tracks.
- Animation groups and timelines.
- Additional matrix and interpolation extensions.

### Milestone 6: User Documentation

- User-facing guides in a dedicated documentation folder; README landing page for the library.
- API reference generated from doc comments using TypeDoc with clean-jsdoc-theme v5.
- Storybook of live examples (React renderer, Vite builder) covering authoring styles, easing, interpolation, playback, and render adapters.
- Single GitHub Pages site hosting documentation and storybook side by side under one deployment.
- Makefile-driven documentation/storybook builds with a `github_pages_deploy` target for the combined site.

### 20.1 Future Timeline Milestones

When Timeline composition is implemented, the recommended development order is:

1. Define a platform-independent Timeline definition and child entry representation.
2. Support absolute placement, sequence, and parallel composition.
3. Support independent child durations and nested timelines.
4. Add deterministic sampling and duration calculation.
5. Integrate Timeline Playback with the existing centralized scheduler.
6. Add finite and infinite repetition for complete timelines and individual segments.
7. Add stagger helpers that compile to ordinary timeline entries.
8. Consider generator-based choreography as an authoring convenience that compiles eagerly into immutable timeline data.

Generator-based choreography must follow the existing generator policy: synchronous generators are consumed during definition construction, not during playback.

## 21. Success Criteria

The design is successful if:

- A developer can create and play a simple animation in a few lines.
- Animation definitions can be reused across multiple independent playback instances.
- Generators can define complex keyframe sequences without requiring custom animation classes.
- Generator execution is deterministic and independent of playback.
- The core can run without a browser environment.
- Manual sampling works without a scheduler or render target.
- Time-based and progress-based sampling produce equivalent results.
- Render targets can be added without modifying the animation engine.
- Matrix representations interoperate without changing transform semantics.
- Playback behavior remains deterministic and testable.
- Custom clocks, schedulers, and rendering systems can be integrated without modifying the core.

---

### 21.1 Future Timeline Success Criteria

The Timeline design will be successful if:

- Multiple targets can animate at different start times and durations under one shared Playback.
- Animations can be sequenced, run in parallel, and nested without changing the meaning of existing Animation composition.
- A complete timeline or an individual child can repeat independently.
- Finite and infinite repetition have explicit duration and completion semantics.
- Staggering is a convenience over the same underlying scheduling model.
- Timeline definitions can be sampled deterministically without a scheduler or render target.
- The composed system preserves the existing separation between definitions, playback, scheduling, and rendering.

## Appendix A: Final API Design Decisions

| Area                       | Decision                                    |
| -------------------------- | ------------------------------------------- |
| Transform mutability       | Immutable public values                     |
| Transform representation   | Position, quaternion rotation, scale        |
| Matrix representation      | Portable canonical Matrix4                  |
| Coordinate system          | Right-handed, column vectors                |
| Matrix storage             | Column-major                                |
| Keyframe positions         | Normalized 0–1                              |
| Animation duration         | Milliseconds                                |
| Manual sampling            | Both milliseconds and normalized progress   |
| Sampling methods           | `sample()` and `sampleProgress()`           |
| Playback seeking           | `seek()` and `seekProgress()`               |
| Generator execution        | Eager, once during definition creation      |
| Async generators           | Not supported initially                     |
| Keyframe ordering          | Strictly increasing                         |
| Duplicate timestamps       | Invalid                                     |
| Missing keyframe endpoints | Hold endpoint values                        |
| Easing                     | Animation default and per-segment overrides |
| Rotation interpolation     | Quaternion SLERP                            |
| Starting transforms        | Explicit in v1                              |
| Property-level definitions | Supported                                   |
| Concurrent animations      | Replacement semantics                       |
| Composition                | Future property-level tracks                |
| Matrix backend             | Portable default                            |
| Manual sampling            | Included in v1                              |
| Target attachment          | Optional                                    |
| Scheduler                  | Centralized and injectable                  |
| Clock                      | Injectable                                  |
| Animation groups           | Deferred                                    |
| Package distribution       | Unified package initially                   |

### Appendix A.1: Timeline Decisions to Preserve

| Area                   | Recommended future decision                           |
| ---------------------- | ----------------------------------------------------- |
| Composition type       | Separate `Timeline` definition                        |
| Child types            | Animation or nested Timeline                          |
| Child timing           | Independent start time and intrinsic duration         |
| Time units             | Milliseconds for timeline placement and gaps          |
| Composition            | Absolute placement, sequence, parallel, nested        |
| Stagger                | Convenience helper compiling to scheduled entries     |
| Repeat scope           | Playback, individual segment, or whole Timeline       |
| Iteration count        | Total iterations including the first                  |
| Repeat direction       | Normal or alternate                                   |
| Repeat delay           | Gap between iterations, not before first play         |
| Infinite repetition    | Explicit and non-completing                           |
| Duration               | Calculated from child timing; may be infinite         |
| Sampling               | Deterministic at a timeline elapsed time              |
| Rendering              | Target-independent definition; adapters render output |
| Generator choreography | Optional authoring style, eagerly compiled            |
| Additive composition   | Deferred; no implicit additive behavior               |

### Appendix B.1: Additional Timeline Boundary

A Timeline is not a replacement for Animation, Playback, or Scheduler.

- Animation remains the reusable motion definition.
- Timeline remains the reusable temporal composition definition.
- Playback remains the execution instance and transport.
- Scheduler remains responsible for coordinated updates.
- RenderTarget remains responsible for applying output to a rendering system.

Timeline children must not create independent clocks when they are part of one composed playback. Their local times are derived from the shared timeline time.

## Appendix B: Important Architectural Boundaries

The following distinctions should remain fundamental throughout implementation:

1. **Animation definitions are not playback instances.** Definitions describe motion; playback instances execute it.
2. **Generators are not playback mechanisms.** They produce keyframes that become immutable timeline data.
3. **Keyframe progress is not elapsed time.** Normalized keyframe positions and millisecond durations are separate concepts.
4. **Sampling is not playback.** An animation can be evaluated without scheduling, attaching, or mutating anything.
5. **Transforms are not matrices.** Transforms are component-based mathematical values; matrices are their interoperable rendering representation.
6. **Playback is not rendering.** Playback evaluates animation and submits values; adapters translate those values into rendering operations.
7. **Scheduling is not timekeeping.** The clock provides time, while the scheduler coordinates updates.
8. **Rendering targets are not owned resources.** Disposing playback must not destroy the underlying rendering objects.

These boundaries are the foundation of the library's extensibility and should guide implementation decisions as the API evolves.

### Appendix C: Timeline API Status

The Timeline material added to Sections 3, 13, 14, 16, 19, 20, 21, and Appendix A/B records the recommended future direction for multi-element orchestration and repetition. It does not move or replace existing definitions, and illustrative API snippets are not final signatures.

The initial implementation milestones and non-goals remain authoritative for the initial release. Timeline composition should be introduced in a later milestone while preserving the architectural boundaries established in this vision.
