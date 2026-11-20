import { Transform } from "../transform/transform.ts";
import type { TransformInit } from "../transform/transform.ts";
import { linear, resolveEasing } from "./easing.ts";
import type { Easing, EasingFunction } from "./easing.ts";

/**
 * A generic keyframe: a value attached to a normalized position (§6.1).
 * `at` is progress in `[0, 1]`, independent of duration (§6.2).
 */
export interface Keyframe<T> {
  /** Normalized timeline position in `[0, 1]` (§6.1). */
  readonly at: number;
  /** The value reached at this keyframe. */
  readonly value: T;
}

/**
 * A transform keyframe as authored (§6.1). `easing` controls the
 * interpolation from this keyframe to the next one (§8); it is omitted on the
 * final keyframe because there is no following segment.
 */
export interface TransformKeyframe {
  /** Normalized timeline position in `[0, 1]`, strictly increasing (§6.3). */
  readonly at: number;
  /** Complete transform or property-level partial value reached here (§7). */
  readonly transform: Transform | TransformInit;
  /** Segment easing controlling interpolation to the next keyframe (§8). */
  readonly easing?: Easing | undefined;
}

/**
 * A keyframe after eager normalization (§5.5): transforms are coerced to
 * `Transform` instances and named easings are resolved to functions once, so
 * every playback instance shares identical, pre-validated timeline data.
 *
 * `rotationAngles` carries authored Euler angles in radians (X→Y→Z) when the
 * definition opted into angular rotation tracks (§9.1, T35). Quaternion-only
 * authored values are decomposed instead; a quaternion alone cannot express
 * full revolutions, which is exactly what captured angles preserve.
 */
export interface NormalizedKeyframe {
  /** Normalized timeline position in `[0, 1]` (§6.1). */
  readonly at: number;
  /** Fully coerced transform — partial authoring inputs are merged away (§7). */
  readonly transform: Transform;
  /** Resolved segment easing, or `undefined` to use the animation default (§8). */
  readonly easing?: EasingFunction | undefined;
  /** Authored Euler angles in radians for angular rotation tracks (§9.1). */
  readonly rotationAngles?: readonly [number, number, number];
}

/**
 * Sources accepted for `keyframes` definitions (§5.4): arrays, synchronous
 * iterables, generator instances, and functions returning synchronous
 * iterables. All are consumed eagerly and exactly once when the animation
 * definition is created (§5.5).
 */
export type TransformKeyframeSource =
  | readonly TransformKeyframe[]
  | Iterable<TransformKeyframe>
  | (() => Iterable<TransformKeyframe>);

/** Coerces an authored transform value into a canonical `Transform`. */
export function coerceTransform(value: Transform | TransformInit, context: string): Transform {
  if (value instanceof Transform) return value;
  if (value !== null && typeof value === "object" && !Array.isArray(value)) {
    return Transform.fromInit(value);
  }
  throw new TypeError(
    `${context} must be a Transform or a transform init object such as { position: [x, y, z] }.`,
  );
}

/** Validates a keyframe timestamp against §6.3 (finite, in `[0, 1]`). */
function validateKeyframeAt(at: unknown, index: number): number {
  if (typeof at !== "number" || !Number.isFinite(at)) {
    throw new TypeError(
      `Keyframe ${index} has an invalid \`at\` timestamp: ${String(at)}. Timestamps must be finite numbers in [0, 1].`,
    );
  }
  if (at < 0 || at > 1) {
    throw new RangeError(
      `Keyframe ${index} has \`at = ${at}\` outside the normalized range [0, 1] (§6.1).`,
    );
  }
  return at;
}

/**
 * Extracts authored Euler angles in radians from an authored transform value:
 * rotation given as a `[x, y, z]` tuple is captured verbatim (preserving full
 * revolutions that quaternions collapse), otherwise the quaternion is
 * decomposed via `Quaternion#toEuler`. Used by angular rotation tracks (§9.1).
 */
export function captureRotationAngles(
  authored: Transform | TransformInit,
): readonly [number, number, number] {
  if (authored !== null && typeof authored === "object" && !(authored instanceof Transform)) {
    const rotation = (authored as TransformInit).rotation;
    // `Array.isArray` does not narrow `readonly` tuples, hence the casts.
    if (Array.isArray(rotation)) {
      const angles: [number, number, number] = [
        rotation[0] as number,
        rotation[1] as number,
        rotation[2] as number,
      ];
      for (const angle of angles) {
        if (typeof angle !== "number" || !Number.isFinite(angle)) {
          throw new TypeError(
            "Angular rotation tracks require finite Euler angles in radians (§9.1).",
          );
        }
      }
      return Object.freeze(angles);
    }
  }
  const transform = coerceTransform(authored, "Keyframe transform");
  return Object.freeze([...transform.components.rotation.toEuler()] as [number, number, number]);
}

/**
 * Eagerly consumes and validates a keyframe source into a frozen-ready,
 * strictly increasing timeline (§5.5, §6.3).
 *
 * - Arrays, synchronous iterables, generator instances, and functions
 *   returning iterables are supported; the function (or generator) runs
 *   exactly once here and is not retained afterwards (§5.4, §5.5).
 * - Empty sources throw; a single keyframe produces a constant animation.
 * - Timestamps must be strictly increasing — out-of-order or duplicate
 *   timestamps throw rather than being silently reordered (§6.3).
 * - With `captureRotationAngles`, each keyframe additionally records Euler
 *   angles for angular rotation tracks (§9.1).
 */
export function normalizeTransformKeyframes(
  source: TransformKeyframeSource,
  options?: { readonly captureRotationAngles?: boolean },
): NormalizedKeyframe[] {
  // Generator functions and factory functions run exactly once here (§5.5).
  const iterable = typeof source === "function" ? source() : source;

  if (iterable === null || typeof iterable !== "object") {
    throw new TypeError(
      "Keyframes must be an array, a synchronous iterable, a generator instance, or a function returning one (§5.4).",
    );
  }
  if ((iterable as { [Symbol.asyncIterator]?: unknown })[Symbol.asyncIterator] !== undefined) {
    throw new TypeError("Async iterables and async generators are not supported (§5.5).");
  }
  if (typeof (iterable as Iterable<TransformKeyframe>)[Symbol.iterator] !== "function") {
    throw new TypeError(
      "Keyframes must be an array, a synchronous iterable, a generator instance, or a function returning one (§5.4).",
    );
  }

  const normalized: NormalizedKeyframe[] = [];
  let previousAt = Number.NEGATIVE_INFINITY;

  for (const keyframe of iterable as Iterable<TransformKeyframe>) {
    const index = normalized.length;
    if (keyframe === null || typeof keyframe !== "object") {
      throw new TypeError(`Keyframe ${index} must be an object with \`at\` and \`transform\`.`);
    }

    const at = validateKeyframeAt(keyframe.at, index);
    if (at <= previousAt) {
      throw new RangeError(
        at === previousAt
          ? `Keyframe ${index} duplicates the timestamp ${at}; keyframe timestamps must be strictly increasing (§6.3).`
          : `Keyframe ${index} has \`at = ${at}\` after \`at = ${previousAt}\`; keyframes must be strictly increasing and are never silently reordered (§6.3).`,
      );
    }

    const transform = coerceTransform(keyframe.transform, `Keyframe ${index} transform`);
    // Named easings are resolved eagerly so unknown names throw at definition
    // time; `linear` is an unreachable fallback because every authored value
    // here is either a function or a name validated by `resolveEasing`.
    const easing =
      keyframe.easing === undefined ? undefined : resolveEasing(keyframe.easing, linear);

    const normalizedKeyframe: NormalizedKeyframe =
      options?.captureRotationAngles === true
        ? {
            at,
            transform,
            easing,
            rotationAngles: captureRotationAngles(keyframe.transform),
          }
        : { at, transform, easing };

    normalized.push(Object.freeze(normalizedKeyframe));
    previousAt = at;
  }

  if (normalized.length === 0) {
    throw new Error("Animation.from() requires at least one keyframe (§6.3).");
  }
  return normalized;
}
