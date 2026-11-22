/**
 * React integration for keyframe-flow — dedicated component helpers that own
 * a `Playback` per mounted element. Import from the `keyframe-flow/react`
 * subpath; the core package stays framework-free (§2 principle 1), and this
 * entry is where React enters the library.
 */
export { useKeyframePlayback } from "./use-keyframe-playback.ts";
export type {
  KeyframePlaybackHandle,
  UseKeyframePlaybackOptions,
} from "./use-keyframe-playback.ts";
export { Animated } from "./animated.tsx";
export type { AnimatedProps } from "./animated.tsx";
