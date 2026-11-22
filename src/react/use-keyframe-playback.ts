import { useCallback, useEffect, useRef, useState } from "react";
import type * as React from "react";

import type {
  Animation,
  Playback,
  PlaybackOptions,
  PlaybackResult,
  PlaybackState,
  RenderTarget,
} from "../index.ts";

/**
 * Options for {@link useKeyframePlayback}: every {@link PlaybackOptions} field
 * plus the render-target factory. Changing any of these values re-attaches a
 * fresh playback (the old one is disposed; the host element survives §17.2).
 */
export interface UseKeyframePlaybackOptions extends PlaybackOptions {
  /**
   * Builds the render target from the mounted host element — typically
   * `(host) => target.html(host)` or an adapter for SVG/Canvas/GPU output.
   * Omit it to run a target-less playback and drive rendering yourself by
   * reading `currentTime` and sampling the animation (§10.3).
   */
  readonly makeTarget?: ((host: HTMLElement) => RenderTarget) | undefined;
}

/**
 * The live view of the playback created by {@link useKeyframePlayback}: refs
 * to wire into JSX, mirrored state for readouts, and transport controls that
 * keep the mirror fresh after every discrete action.
 */
export interface KeyframePlaybackHandle<T extends HTMLElement = HTMLDivElement> {
  /** Attach to the element hosting the render target (§17). */
  ref: React.RefObject<T | null>;
  /** The live `Playback`, or `undefined` before mount and after unmount. */
  playbackRef: React.RefObject<Playback | undefined>;
  /** Mirrored lifecycle state (`idle → running ⇄ paused → finished/cancelled`, §12). */
  state: PlaybackState;
  /** Mirrored timeline position in ms. */
  currentTime: number;
  /** Mirrored iteration index, zero-based (§13). */
  iterationCount: number;
  /** Completion result once the run settles; cleared by re-attach and reset. */
  result: PlaybackResult | undefined;
  /** Start or resume the run (§12). */
  play(): void;
  /** Freeze time, retaining position (§12). */
  pause(): void;
  /** Flip direction for subsequent runs (§12). */
  reverse(): void;
  /** Rewind to progress 0 facing forward so the next `play()` runs 0 → 1. */
  reset(): void;
  /** Cancel the run and rewind to the start (§12). */
  cancel(): void;
  /** Jump to an absolute timeline position in ms (§16). */
  seek(timeMs: number): void;
  /** Jump by normalized progress in `[0, 1]` (§16). */
  seekProgress(progress: number): void;
}

/**
 * React hook owning one `Playback` for an immutable {@link Animation} (§11).
 * The playback is created on mount from the host element behind `ref`, re-attaches
 * whenever the animation or any option changes identity, and disposes on
 * unmount — disposal never destroys the host element or its content (§12, B.8).
 *
 * Because `Playback` exposes no event bus, state is mirrored on frames while a
 * run is live, and re-synced whenever a transport control acts, so readouts
 * never go stale after play-after-finish, reset, or seek.
 *
 * Memoize the `animation` (e.g. `useMemo`) and `options.makeTarget` (e.g.
 * `useCallback`) — new identities on every render would re-attach each render.
 *
 * ```tsx
 * const animation = useMemo(() => Animation.from({ from: transform().translate(0, 20), to: transform(), duration: 300 }), []);
 * const { ref, state, play } = useKeyframePlayback<HTMLDivElement>(animation, {
 *   autoplay: true,
 *   makeTarget: useCallback((host) => target.html(host), []),
 * });
 * return (
 *   <>
 *     <div ref={ref} />
 *     <button onClick={play}>play ({state})</button>
 *   </>
 * );
 * ```
 */
export function useKeyframePlayback<T extends HTMLElement = HTMLDivElement>(
  animation: Animation,
  options?: UseKeyframePlaybackOptions,
): KeyframePlaybackHandle<T> {
  const ref = useRef<T | null>(null);
  const playbackRef = useRef<Playback | undefined>(undefined);
  const [state, setState] = useState<PlaybackState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [iterationCount, setIterationCount] = useState(0);
  const [result, setResult] = useState<PlaybackResult | undefined>(undefined);

  // Attach on mount and whenever any option changes identity — the scalar
  // fields are depended on individually so inline option objects don't churn.
  const makeTarget = options?.makeTarget;
  const iterations = options?.iterations;
  const direction = options?.direction;
  const playbackRate = options?.playbackRate;
  const autoplay = options?.autoplay;
  const engine = options?.engine;

  // Mirror live playback state on frames while a run is live, and re-kick on
  // every control action: the loop stops as soon as playback leaves "running",
  // so without a kick a discrete action (play after finish, reset, seek) would
  // leave the readout stale. One rAF handle for the whole hook lifetime.
  const rafRef = useRef(0);
  const kickSync = useCallback(() => {
    cancelAnimationFrame(rafRef.current);
    const sync = (): void => {
      const playback = playbackRef.current;
      if (playback === undefined) return;
      setState(playback.state);
      setCurrentTime(playback.currentTime);
      setIterationCount(playback.iterationCount);
      if (playback.state === "running") {
        rafRef.current = requestAnimationFrame(sync);
      }
    };
    sync();
  }, []);

  useEffect(() => {
    const host = ref.current;
    if (host === null) return;

    setResult(undefined);
    // Build only the keys actually set (exactOptionalPropertyTypes: explicit
    // `undefined` is not assignable to the readonly optional fields).
    const playbackOptions: PlaybackOptions = {
      ...(iterations !== undefined && { iterations }),
      ...(direction !== undefined && { direction }),
      ...(playbackRate !== undefined && { playbackRate }),
      ...(autoplay !== undefined && { autoplay }),
      ...(engine !== undefined && { engine }),
    };
    const playback = animation.attach(
      makeTarget !== undefined ? makeTarget(host) : undefined,
      playbackOptions,
    );
    playbackRef.current = playback;
    void playback.finished.then((r) => {
      setResult(r);
      setState(playback.state);
    });

    kickSync();

    return () => {
      cancelAnimationFrame(rafRef.current);
      playback.dispose();
      playbackRef.current = undefined;
    };
  }, [animation, makeTarget, iterations, direction, playbackRate, autoplay, engine, kickSync]);

  const play = useCallback(() => {
    playbackRef.current?.play();
    kickSync();
  }, [kickSync]);
  const pause = useCallback(() => {
    playbackRef.current?.pause();
    kickSync();
  }, [kickSync]);
  const reverse = useCallback(() => {
    playbackRef.current?.reverse();
    kickSync();
  }, [kickSync]);
  // Rewind to the start facing forward: §12 restarts a run "in current
  // direction", so any reverse() flip is undone here and the next play()
  // always runs 0 → 1. Seeking also re-evaluates and renders frame zero.
  const reset = useCallback(() => {
    const playback = playbackRef.current;
    if (playback === undefined) return;
    if (playback.reversed) playback.reverse();
    setResult(undefined);
    playback.seek(0);
    kickSync();
  }, [kickSync]);
  const cancel = useCallback(() => {
    playbackRef.current?.cancel();
    kickSync();
  }, [kickSync]);
  const seek = useCallback(
    (timeMs: number) => {
      playbackRef.current?.seek(timeMs);
      kickSync();
    },
    [kickSync],
  );
  const seekProgress = useCallback(
    (progress: number) => {
      playbackRef.current?.seekProgress(progress);
      kickSync();
    },
    [kickSync],
  );

  return {
    ref,
    playbackRef,
    state,
    currentTime,
    iterationCount,
    result,
    play,
    pause,
    reverse,
    reset,
    cancel,
    seek,
    seekProgress,
  };
}
