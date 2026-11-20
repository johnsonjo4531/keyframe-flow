import { Playback } from "../playback/playback.ts";
import type { PlaybackOptions } from "../playback/playback.ts";
import type { RenderTarget } from "../targets/types.ts";
import { Quaternion } from "../transform/quaternion.ts";
import type { QuaternionLike } from "../transform/quaternion.ts";
import { Vector3 } from "../transform/vector3.ts";
import { Transform } from "../transform/transform.ts";
import type { TransformComponentsInit, TransformInit } from "../transform/transform.ts";
import { linear, resolveEasing } from "./easing.ts";
import type { Easing, EasingFunction } from "./easing.ts";
import { captureRotationAngles, normalizeTransformKeyframes } from "./keyframes.ts";
import type { NormalizedKeyframe, TransformKeyframeSource } from "./keyframes.ts";
import { interpolateTransforms, interpolateTransformsWithAngles } from "./interpolation.ts";

/** Options accepted by `Animation.attach` (§11). */
export type AttachOptions = PlaybackOptions;

/**
 * How rotation interpolates between keyframes (§9.1).
 *
 * - `"quaternion"` (default): SLERP with shortest-path — the correct choice
 *   for orientations, but equivalent orientations never describe a revolution.
 * - `"angular"`: component-wise interpolation of authored Euler angles in
 *   radians, enabling full revolutions without intermediate keyframes (§9.1).
 */
export type RotationMode = "quaternion" | "angular";

/**
 * Interpolation strategy for animation sampling (§9).
 *
 * - `"trs"` (default): property-aware interpolation — linear translation and
 *   scale, quaternion SLERP or angular rotation interpolation (§9.1).
 * - `"raw-matrix"`: explicit advanced raw element-wise interpolation of the
 *   endpoint matrices (§9.2). Raw results that are not TRS-decomposable throw
 *   explicitly rather than being approximated; interpolated rotations in
 *   particular usually produce shear.
 */
export type AnimationInterpolation = "trs" | "raw-matrix";

/** Fields shared by every animation definition shape. */
interface AnimationDefinitionBase {
  /** Total duration in milliseconds (§6.2). */
  readonly duration: number;
  /** Animation-level default easing (§8). Defaults to `"linear"`. */
  readonly easing?: Easing | undefined;
  /** Rotation interpolation strategy (§9.1). Defaults to `"quaternion"`. */
  readonly rotationMode?: RotationMode;
  /** Advanced interpolation strategy (§9.2). Defaults to `"trs"`. */
  readonly interpolation?: AnimationInterpolation;
}

/**
 * From/to definition (§5.2). `from` and `to` accept complete transforms or
 * property-level partial objects (§7); unspecified properties are preserved
 * from the explicit starting transform, falling back to documented identity
 * defaults when no starting transform is supplied.
 */
export interface AnimationFromToDefinition extends AnimationDefinitionBase {
  /** Starting transform or property-level partial (§5.2, §7); omitted means identity. */
  readonly from?: Transform | TransformInit;
  /** Ending transform or property-level partial; properties not specified are preserved from `from` (§7). */
  readonly to?: Transform | TransformInit;
}

/** Keyframe definition (§5.3, §5.4) with an eager keyframe source (§5.5). */
export interface AnimationKeyframesDefinition extends AnimationDefinitionBase {
  /** Array, iterable, generator instance, or factory function — consumed eagerly once at definition time (§5.4, §5.5). */
  readonly keyframes: TransformKeyframeSource;
}

/** Any animation definition accepted by `Animation.from()` (§5.1). */
export type AnimationDefinition = AnimationFromToDefinition | AnimationKeyframesDefinition;

/** Layout modes for `Animation.group` (§14, §19). */
export type GroupLayout = "sequence" | "parallel";

/** Options for `Animation.group`. */
export interface AnimationGroupOptions {
  /**
   * `"sequence"` (default) plays children back to back over the summed
   * duration; `"parallel"` runs them simultaneously over the longest child's
   * duration, merging animated properties with later-wins precedence (§14).
   */
  readonly layout?: GroupLayout;
}

/** Which transform properties an animation actually changes (§14). */
export interface AnimatedProperties {
  /** True when position changes anywhere in the timeline (§14). */
  readonly position: boolean;
  /** True when orientation changes anywhere — q/−q count as equal (§14). */
  readonly rotation: boolean;
  /** True when scale changes anywhere in the timeline (§14). */
  readonly scale: boolean;
}

const IDENTITY = new Transform();
const ANGLE_EPSILON = 1e-9;

function clamp01(value: number): number {
  return value < 0 ? 0 : value > 1 ? 1 : value;
}

/** Durations are finite, non-negative milliseconds (§6.2). */
function validateDuration(duration: unknown): number {
  if (typeof duration !== "number" || !Number.isFinite(duration)) {
    throw new TypeError(
      `Animation \`duration\` must be a finite number of milliseconds (§6.2); received ${String(duration)}.`,
    );
  }
  if (duration < 0) {
    throw new RangeError(`Animation \`duration\` cannot be negative; received ${duration}.`);
  }
  return duration;
}

/** Validates the advanced interpolation options against §9.2's explicitness rules. */
function validateInterpolationOptions(
  rotationMode: RotationMode,
  interpolation: AnimationInterpolation,
): void {
  if (rotationMode !== "quaternion" && rotationMode !== "angular") {
    throw new RangeError(
      `Animation \`rotationMode\` must be "quaternion" or "angular" (§9.1); received ${String(rotationMode)}.`,
    );
  }
  if (interpolation !== "trs" && interpolation !== "raw-matrix") {
    throw new RangeError(
      `Animation \`interpolation\` must be "trs" or "raw-matrix" (§9.2); received ${String(interpolation)}.`,
    );
  }
  if (rotationMode === "angular" && interpolation === "raw-matrix") {
    throw new Error(
      'Animation options `rotationMode: "angular"` and `interpolation: "raw-matrix"` conflict (§9): raw matrix interpolation never consults rotation tracks.',
    );
  }
}

/** Coerces an init rotation — quaternion or Euler radians tuple (§4.3) — to a quaternion. */
function rotationFromInit(
  rotation: QuaternionLike | readonly [number, number, number],
): Quaternion {
  // `Array.isArray` does not narrow `readonly` tuples, hence the cast below.
  return Array.isArray(rotation)
    ? Quaternion.fromEuler(rotation[0] as number, rotation[1] as number, rotation[2] as number)
    : Quaternion.from(rotation as QuaternionLike);
}

/**
 * Normalizes a property-level definition into a complete transform (§7):
 * properties specified in `partial` win, everything else is preserved from
 * `base`. A full `Transform` specifies everything and replaces `base`.
 */
function mergeTransformProperties(base: Transform, partial: Transform | TransformInit): Transform {
  if (partial instanceof Transform) return partial;
  if (partial === null || typeof partial !== "object" || Array.isArray(partial)) {
    throw new TypeError(
      "Property-level animation values must be a Transform or an object such as { position: [x, y, z] } (§7).",
    );
  }

  const init: TransformComponentsInit = { ...base.components };
  if (partial.position !== undefined) init.position = partial.position;
  if (partial.rotation !== undefined) init.rotation = rotationFromInit(partial.rotation);
  if (partial.scale !== undefined) {
    init.scale =
      typeof partial.scale === "number"
        ? [partial.scale, partial.scale, partial.scale]
        : partial.scale;
  }
  return new Transform(init);
}

/** Orientation equality for animated-property detection: q and −q are equal. */
function sameOrientation(a: Quaternion, b: Quaternion): boolean {
  return Math.abs(Math.abs(a.dot(b)) - 1) <= ANGLE_EPSILON;
}

function sameVector3(a: Vector3, b: Vector3): boolean {
  return a.equals(b, ANGLE_EPSILON);
}

/**
 * An immutable, reusable animation definition (§5.1). Definitions describe
 * motion; they are not playback instances and hold no execution state
 * (Appendix B.1). All keyframe sources — arrays, synchronous iterables,
 * generator instances, and functions returning iterables — are consumed
 * eagerly and exactly once when `Animation.from()` is called, producing a
 * normalized timeline that every consumer shares (§5.5).
 *
 * @remarks
 * Manual sampling is first-class and requires no scheduler or render target
 * (§10); `sample(ms)` and `sampleProgress(p)` evaluate the same timeline.
 *
 * Composite definitions created by {@link Animation.combine} and
 * {@link Animation.group} evaluate through property tracks and child routing
 * instead of materialized keyframes — their `keyframes` array is empty and
 * their inputs are exposed as {@link Animation.children} (§14).
 */
export class Animation {
  /** Total duration in milliseconds (§6.2). */
  readonly duration: number;

  /**
   * The eagerly normalized, frozen timeline shared by all consumers (§5.5).
   * Composite animations built by `combine`/`group` evaluate through their
   * `Animation.children` instead and expose an empty timeline here.
   */
  readonly keyframes: readonly NormalizedKeyframe[];

  /** Inputs of a composite animation (`combine`/`group`); `[]` otherwise (§14). */
  readonly children: readonly Animation[];

  private readonly _defaultEasing: EasingFunction;
  private readonly _rotationMode: RotationMode;
  private readonly _matrixInterpolation: boolean;
  /** Present on composite animations; bypasses keyframe segment evaluation. */
  private readonly _evaluator: ((progress: number) => Transform) | undefined;
  private _animatedProperties: AnimatedProperties | undefined;

  private constructor(
    duration: number,
    keyframes: NormalizedKeyframe[],
    defaultEasing: EasingFunction,
    options: {
      readonly rotationMode?: RotationMode;
      readonly matrixInterpolation?: boolean;
      readonly evaluator?: (progress: number) => Transform;
      readonly children?: readonly Animation[];
    } = {},
  ) {
    this.duration = duration;
    this.keyframes = Object.freeze(keyframes);
    this._defaultEasing = defaultEasing;
    this._rotationMode = options.rotationMode ?? "quaternion";
    this._matrixInterpolation = options.matrixInterpolation === true;
    this._evaluator = options.evaluator;
    this.children = Object.freeze([...(options.children ?? [])]);
  }

  /**
   * Creates an immutable animation definition from a from/to definition
   * (§5.2), a property-level definition (§7), or a keyframe definition with
   * array, iterable, generator, or factory sources (§5.3–§5.5). Keyframes are
   * normalized and validated eagerly; invalid definitions throw here rather
   * than failing later during sampling or playback (§6.3).
   *
   * @example
   * ```ts
   * import { Animation } from "keyframe-flow";
   *
   * const fadeUp = Animation.from({
   *   from: { position: [0, 20, 0] }, // property-level (§7): scale stays identity
   *   to: { position: [0, 0, 0] },
   *   duration: 300,
   *   easing: "ease-out",
   * });
   * ```
   */
  static from(definition: AnimationDefinition): Animation {
    if (definition === null || typeof definition !== "object" || Array.isArray(definition)) {
      throw new TypeError(
        "Animation.from() expects a definition object such as { from, to, duration } or { keyframes, duration } (§5.1).",
      );
    }

    const duration = validateDuration(definition.duration);
    const defaultEasing = resolveEasing(definition.easing, linear);
    const rotationMode = definition.rotationMode ?? "quaternion";
    const interpolation = definition.interpolation ?? "trs";
    validateInterpolationOptions(rotationMode, interpolation);

    // Read the union through an all-optional view of both definition shapes.
    const def: Partial<AnimationFromToDefinition & AnimationKeyframesDefinition> = definition;
    const hasKeyframes = def.keyframes !== undefined;
    const hasFromTo = def.from !== undefined || def.to !== undefined;

    if (hasKeyframes && hasFromTo) {
      throw new Error(
        "Animation.from() accepts either `keyframes` or `from`/`to`, not both (§5.1).",
      );
    }

    let keyframes: NormalizedKeyframe[];
    if (hasKeyframes) {
      keyframes = normalizeTransformKeyframes(def.keyframes as TransformKeyframeSource, {
        captureRotationAngles: rotationMode === "angular",
      });
    } else if (hasFromTo) {
      // Property-level normalization (§7): missing `from` uses documented
      // identity defaults, and properties unspecified in `to` are preserved
      // from the resolved starting transform.
      const start =
        def.from === undefined ? IDENTITY : mergeTransformProperties(IDENTITY, def.from);
      const end = def.to === undefined ? start : mergeTransformProperties(start, def.to);
      const startAngles =
        rotationMode === "angular" ? captureRotationAngles(def.from ?? new Transform()) : undefined;
      const endAngles =
        rotationMode === "angular" ? captureRotationAngles(def.to ?? start) : undefined;
      const startFrame: NormalizedKeyframe =
        startAngles === undefined
          ? { at: 0, transform: start, easing: undefined }
          : { at: 0, transform: start, easing: undefined, rotationAngles: startAngles };
      const endFrame: NormalizedKeyframe =
        endAngles === undefined
          ? { at: 1, transform: end, easing: undefined }
          : { at: 1, transform: end, easing: undefined, rotationAngles: endAngles };
      keyframes = [Object.freeze(startFrame), Object.freeze(endFrame)];
    } else {
      throw new Error(
        "Animation.from() requires `keyframes` or at least one of `from`/`to` (§5.1).",
      );
    }

    return new Animation(duration, keyframes, defaultEasing, {
      rotationMode,
      matrixInterpolation: interpolation === "raw-matrix",
    });
  }

  /**
   * Composes independent animations into one definition through property
   * tracks (§14): at any progress point, each input is sampled by elapsed
   * time (shorter inputs hold their final value once complete), and the
   * result merges per transform property — an input only overrides the
   * properties it actually animates, with later inputs winning overlaps. The
   * combined duration is the longest input's duration.
   *
   * This is the convenience layer over the track model; movement, rotation,
   * and scale authored as separate animations compose without manually
   * authoring a combined animation (§14).
   *
   * @example
   * ```ts
   * const move = Animation.from({ to: { position: [200, 0, 0] }, duration: 1000 });
   * const spin = Animation.from({ to: { rotation: [0, Math.PI, 0] }, duration: 1000 });
   * const pulse = Animation.from({ to: { scale: 1.4 }, duration: 500 });
   *
   * const composed = Animation.combine([move, spin, pulse]);
   * composed.attach(target.html(element)).play();
   * ```
   */
  static combine(animations: readonly Animation[]): Animation {
    const children = validateAnimationList("Animation.combine()", animations);
    const duration = Math.max(...children.map((child) => child.duration));
    return new Animation(duration, [], linear, {
      evaluator: (progress) => mergeAnimatedProperties(children, progress * duration),
      children,
    });
  }

  /**
   * Groups animations into a single definition — full groups and nested
   * timelines (§14, §19). Because groups are ordinary `Animation` values,
   * nesting composes naturally: groups can contain groups.
   *
   * @remarks
   * - `"sequence"` (default): children play back to back; the group's
   * duration is the sum of child durations.
   * - `"parallel"`: children run simultaneously over the longest child's
   * duration, merging animated properties with later-wins precedence —
   * equivalent to {@link Animation.combine}.
   *
   * @example
   * ```ts
   * const showThenSpin = Animation.group([fadeIn, spin]); // one after the other
   * const entrance = Animation.group([move, rotate], { layout: "parallel" });
   * const scene = Animation.group([entrance, tail]); // groups nest naturally
   * ```
   */
  static group(animations: readonly Animation[], options?: AnimationGroupOptions): Animation {
    const children = validateAnimationList("Animation.group()", animations);
    const layout = options?.layout ?? "sequence";
    if (layout !== "sequence" && layout !== "parallel") {
      throw new RangeError(
        `Animation.group() \`layout\` must be "sequence" or "parallel" (§14); received ${String(layout)}.`,
      );
    }

    if (layout === "parallel") {
      const duration = Math.max(...children.map((child) => child.duration));
      return new Animation(duration, [], linear, {
        evaluator: (progress) => mergeAnimatedProperties(children, progress * duration),
        children,
      });
    }

    // Sequence routing over cumulative natural durations. Zero-duration
    // children contribute no time and are skipped; if every child is
    // zero-duration the group holds its first child's start value.
    const playable = children.filter((child) => child.duration > 0);
    const total = playable.reduce((sum, child) => sum + child.duration, 0);
    if (playable.length === 0) {
      const constant = children[0] as Animation;
      return new Animation(0, [], linear, {
        evaluator: () => constant.sampleProgress(0),
        children,
      });
    }

    const offsets: number[] = [];
    let offset = 0;
    for (const child of playable) {
      offsets.push(offset);
      offset += child.duration;
    }

    return new Animation(total, [], linear, {
      evaluator: (progress) => {
        const timeMs = clamp01(progress) * total;
        // Linear scan; groups are authored by humans, not generated at scale.
        let index = playable.length - 1;
        for (let i = 0; i < playable.length; i++) {
          const child = playable[i] as Animation;
          if (timeMs < (offsets[i] as number) + child.duration) {
            index = i;
            break;
          }
        }
        const child = playable[index] as Animation;
        return child.sample(timeMs - (offsets[index] as number));
      },
      children,
    });
  }

  /**
   * Which transform properties this animation actually changes (§14). Keyframe
   * timelines compare every keyframe; composite animations sample their
   * evaluation. Property tracks built on this detection power
   * `Animation.combine` and parallel groups.
   * @example
   * ```ts
   * const scaleOnly = Animation.from({ to: { scale: 2 }, duration: 500 });
   * scaleOnly.animatedProperties; // { position: false, rotation: false, scale: true }
   * ```
   */
  get animatedProperties(): AnimatedProperties {
    if (this._animatedProperties !== undefined) return this._animatedProperties;

    const samples: Transform[] =
      this.keyframes.length > 0
        ? this.keyframes.map((keyframe) => keyframe.transform)
        : [0, 0.2, 0.4, 0.6, 0.8, 1].map((p) => this.sampleProgress(p));

    const first = samples[0] as Transform;
    let position = false;
    let rotation = false;
    let scale = false;
    for (const sample of samples) {
      const components = sample.components;
      if (!position && !sameVector3(components.position, first.components.position))
        position = true;
      if (!rotation && !sameOrientation(components.rotation, first.components.rotation)) {
        rotation = true;
      }
      if (!scale && !sameVector3(components.scale, first.components.scale)) scale = true;
    }

    this._animatedProperties = Object.freeze({ position, rotation, scale });
    return this._animatedProperties;
  }

  /**
   * Creates an independent playback instance from this definition (§11).
   * The instance has its own execution state and lifecycle while sharing the
   * definition's immutable normalized timeline — definitions are not playback
   * instances (Appendix B.1). Attachment is optional: `attach()` without a
   * target still provides full time control (`play`, `pause`, `seek`,
   * repetition, completion promises) for hosts that render themselves (§11).
   *
   * Concurrent playbacks on the same target follow replacement semantics: the
   * most recently started playback owns the target and supersedes the
   * previous one without additive composition (§14).
   *
   * @example
   * ```ts
   * const playback = spin.attach(target.html(element), { iterations: 2 });
   * playback.play();
   * await playback.finished; // { status: "finished" } — never rejects
   * ```
   */
  attach(target?: RenderTarget, options?: AttachOptions): Playback {
    return new Playback(this, target ?? undefined, options);
  }

  /**
   * Samples the timeline at elapsed milliseconds (§10.1). Out-of-range times
   * are clamped to the animation boundaries; `sample(500)` on a 2000 ms
   * animation is equivalent to `sampleProgress(0.25)`.
   *
   * @example
   * ```ts
   * const slide = Animation.from({ to: { position: [100, 0, 0] }, duration: 1000 });
   * slide.sample(500).components.position.x; // 50
   * slide.sample(2000).components.position.x; // 100 — clamped to the end
   * ```
   */
  sample(timeMs: number): Transform {
    if (typeof timeMs !== "number" || !Number.isFinite(timeMs)) {
      throw new TypeError(`animation.sample() requires a finite number of milliseconds (§10.1).`);
    }
    // A zero-duration timeline has no interior: time at or before its start
    // holds the first value, anything later holds the last.
    const progress = this.duration === 0 ? (timeMs <= 0 ? 0 : 1) : clamp01(timeMs / this.duration);
    return this.sampleProgress(progress);
  }

  /**
   * Samples the timeline at normalized progress in `[0, 1]` (§10.2),
   * evaluating the same underlying timeline as `Animation.sample`.
   * Out-of-range progress is clamped to the animation boundaries. Sampling
   * never mutates the definition and requires no scheduler or render target
   * (§10.3).
   * @example
   * ```ts
   * // Drive your own frame loop — sampling needs nothing else:
   * function draw(progress: number): void {
   * const matrix = slide.sampleProgress(progress).toMatrix();
   * gl.uniformMatrix4fv(uModel, false, matrix.toFloat32Array());
   * }
   * ```
   */
  sampleProgress(progress: number): Transform {
    if (typeof progress !== "number" || !Number.isFinite(progress)) {
      throw new TypeError(`animation.sampleProgress() requires a finite number in [0, 1] (§10.2).`);
    }

    const p = clamp01(progress);
    if (this._evaluator !== undefined) {
      return this._evaluator(p);
    }

    const keyframes = this.keyframes;

    // Missing endpoints hold the first/last value (§6.3). This also makes a
    // single-keyframe timeline a constant animation everywhere.
    const first = keyframes[0] as NormalizedKeyframe;
    if (p <= first.at) return first.transform;
    const last = keyframes[keyframes.length - 1] as NormalizedKeyframe;
    if (p >= last.at) return last.transform;

    // Binary search for the segment containing p: fromK.at < p <= toK.at.
    let lo = 0;
    let hi = keyframes.length - 1;
    while (hi - lo > 1) {
      const mid = (lo + hi) >>> 1;
      if ((keyframes[mid] as NormalizedKeyframe).at <= p) {
        lo = mid;
      } else {
        hi = mid;
      }
    }
    const fromK = keyframes[lo] as NormalizedKeyframe;
    const toK = keyframes[hi] as NormalizedKeyframe;

    // Exact hits return the authored transform untouched.
    if (fromK.at === p) return fromK.transform;
    if (toK.at === p) return toK.transform;

    const localT = (p - fromK.at) / (toK.at - fromK.at);

    // Segment easing: the keyframe's own override, else the animation default;
    // it controls interpolation from that keyframe to the next (§8).
    const easing = fromK.easing ?? this._defaultEasing;
    const eased = easing(localT);
    if (!Number.isFinite(eased)) {
      throw new RangeError(
        "Easing functions must return finite numbers; a non-finite value was produced inside animation sampling.",
      );
    }

    // Advanced raw element-wise matrix interpolation (§9.2): explicit only, and
    // non-decomposable results throw rather than approximating.
    if (this._matrixInterpolation) {
      const raw = fromK.transform.toMatrix().lerp(toK.transform.toMatrix(), eased);
      return Transform.fromMatrix(raw);
    }

    // Angular rotation tracks: component-wise Euler-radians interpolation,
    // enabling full revolutions without intermediate keyframes (§9.1).
    if (
      this._rotationMode === "angular" &&
      fromK.rotationAngles !== undefined &&
      toK.rotationAngles !== undefined
    ) {
      return interpolateTransformsWithAngles(
        fromK.transform,
        toK.transform,
        fromK.rotationAngles,
        toK.rotationAngles,
        eased,
      );
    }

    return interpolateTransforms(fromK.transform, toK.transform, eased);
  }
}

/** Validates the shared input contract of `combine`/`group`. */
function validateAnimationList(context: string, animations: readonly Animation[]): Animation[] {
  if (!Array.isArray(animations) || animations.length === 0) {
    throw new TypeError(`${context} requires a non-empty array of Animation definitions (§14).`);
  }
  for (const animation of animations) {
    if (!(animation instanceof Animation)) {
      throw new TypeError(`${context} expects only Animation instances (§14).`);
    }
  }
  return [...animations];
}

/**
 * Merges animated properties across children at an elapsed-time point (§14):
 * each child is sampled by time — shorter ones hold their final value after
 * completion — and overrides exactly the properties it animates. Later
 * children win overlapping properties; there is no additive composition.
 */
function mergeAnimatedProperties(children: readonly Animation[], timeMs: number): Transform {
  const base = IDENTITY.components;
  let position = base.position;
  let rotation = base.rotation;
  let scale = base.scale;

  for (const child of children) {
    const animated = child.animatedProperties;
    if (!animated.position && !animated.rotation && !animated.scale) continue;
    const components = child.sample(timeMs).components;
    if (animated.position) position = components.position;
    if (animated.rotation) rotation = components.rotation;
    if (animated.scale) scale = components.scale;
  }

  return new Transform({ position, rotation, scale });
}
