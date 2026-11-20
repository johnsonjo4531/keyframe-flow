/**
 * keyframe-flow — a platform-independent transform and animation library.
 *
 * Public imports (§18):
 *
 * ```ts
 * import { Animation, transform, matrix, target } from "keyframe-flow";
 * ```
 *
 * Milestone 1 provides the transform and matrix foundations: `transform`,
 * `matrix`, `Transform`, `Matrix4`, `Vector3`, and `Quaternion`. The core
 * never touches browser APIs (§2 principle 1); interoperability with native
 * matrices happens through explicit conversions (§15.2).
 *
 * Milestone 2 adds animation definitions: `Animation.from()` with from/to,
 * property-level, static-keyframe, and synchronous-generator sources
 * normalized eagerly into immutable shared timelines (§5–§8), plus manual
 * sampling by milliseconds and normalized progress (§10).
 */
export { transform, Transform, Vector3, Quaternion } from "./transform/index.ts";
export type {
  TransformInit,
  TransformComponentsInit,
  Vector3Like,
  Vector3Object,
  QuaternionLike,
  QuaternionObject,
} from "./transform/index.ts";

export { matrix, Matrix4 } from "./matrix/index.ts";
export type {
  MatrixSource,
  TransformComponents,
  DOMMatrixLike,
  DOMMatrixWritable,
  DOMPointInput,
  DOMPointOutput,
} from "./matrix/index.ts";

export { Animation } from "./animation/index.ts";
export type {
  AnimatedProperties,
  AnimationDefinition,
  AnimationFromToDefinition,
  AnimationGroupOptions,
  AnimationInterpolation,
  AnimationKeyframesDefinition,
  AttachOptions,
  EulerAngles,
  GroupLayout,
  Keyframe,
  NormalizedKeyframe,
  RotationMode,
  TransformKeyframe,
  TransformKeyframeSource,
  Easing,
  EasingFunction,
  EasingName,
} from "./animation/index.ts";

export { Playback, PlaybackEngine, getDefaultEngine } from "./playback/index.ts";
export type {
  EngineTickable,
  PlaybackCancelledResult,
  PlaybackDirectionMode,
  PlaybackEngineOptions,
  PlaybackFinishedResult,
  PlaybackOptions,
  PlaybackResult,
  PlaybackState,
} from "./playback/index.ts";

export { systemClock, ManualClock, createFrameScheduler, ManualScheduler } from "./timing/index.ts";
export type { Clock, Scheduler } from "./timing/index.ts";

export { target } from "./targets/index.ts";
export {
  matrixToCssTransform,
  matrixToSvgTransform,
  projectToCanvas2D,
  WebGLRenderTarget,
  WebGPURenderTarget,
} from "./targets/index.ts";
export type {
  Canvas2DTargetOptions,
  CanvasRenderingContext2DLike,
  CssTransformElementLike,
  HtmlTargetOptions,
  RenderTarget,
  SvgTransformElementLike,
  WebGLRenderTargetOptions,
  WebGPURenderTargetOptions,
} from "./targets/index.ts";
