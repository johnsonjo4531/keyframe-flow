import type * as React from "react";
import { useCallback, useEffect, useRef, useState } from "react";

import type {
  PlaybackOptions,
  PlaybackResult,
  PlaybackState,
  Timeline,
  TimelinePlayback,
} from "keyframe-flow";

/**
 * Shared plumbing for the Timeline stories (Milestone 15). Stories build a
 * composition with `useTimelinePlayback` — the timeline twin of the library's
 * `useKeyframePlayback` — and render against the shared `Transport`/`Readout`
 * chrome in `playback-story.tsx`. Like its animation counterpart, this helper
 * is example plumbing, not library API: it owns attach/re-attach/dispose on a
 * host set and mirrors playback state for readouts; the engine stays in the
 * library.
 */

/** The live view of the {@link TimelinePlayback} created by the hook. */
export interface TimelinePlaybackHandle {
  /** Mirrored lifecycle state (`idle → running ⇄ paused → finished/cancelled`, §12). */
  readonly state: PlaybackState;
  /** Mirrored shared timeline position in ms (§16.1). */
  readonly currentTime: number;
  /** Mirrored playback-level iteration index, zero-based (§13.1). */
  readonly iterationCount: number;
  /** Completion result once the run settles; cleared by re-attach and reset. */
  readonly result: PlaybackResult | undefined;
  /** Start or resume the composed run (§12). */
  play(): void;
  /** Freeze shared time, retaining position (§12). */
  pause(): void;
  /** Flip direction for subsequent runs (§12). */
  reverse(): void;
  /** Rewind to time 0 facing forward so the next `play()` runs 0 → horizon. */
  reset(): void;
  /** Cancel the run and release target ownership (§12). */
  cancel(): void;
}

/** Resolves a story host ref inside the timeline factory (effects run post-commit, so hosts exist). */
export function requireHost(ref: React.RefObject<HTMLElement | null>): HTMLElement {
  const element = ref.current;
  if (element === null) {
    throw new Error("Timeline story host element is not mounted.");
  }
  return element;
}

/**
 * Owns one `TimelinePlayback` for a composition built by `makeTimeline`. The
 * playback attaches on mount, re-attaches whenever the factory changes
 * identity (memoize it with `useCallback` over the story args — same contract
 * as `useKeyframePlayback`), and disposes on unmount. State is mirrored on
 * frames while a run is live and re-kicked after every transport action so
 * readouts never go stale.
 */
export function useTimelinePlayback(
  makeTimeline: () => Timeline,
  options?: PlaybackOptions,
): TimelinePlaybackHandle {
  const playbackRef = useRef<TimelinePlayback | undefined>(undefined);
  const [state, setState] = useState<PlaybackState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [iterationCount, setIterationCount] = useState(0);
  const [result, setResult] = useState<PlaybackResult | undefined>(undefined);

  // Depend on the scalar option fields individually so inline option objects
  // don't churn the attach (mirrors useKeyframePlayback).
  const iterations = options?.iterations;
  const direction = options?.direction;
  const playbackRate = options?.playbackRate;
  const autoplay = options?.autoplay;

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
    const timeline = makeTimeline();
    const playbackOptions: PlaybackOptions = {
      ...(iterations !== undefined && { iterations }),
      ...(direction !== undefined && { direction }),
      ...(playbackRate !== undefined && { playbackRate }),
      ...(autoplay !== undefined && { autoplay }),
    };
    const playback = timeline.attach(playbackOptions);
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
  }, [makeTimeline, iterations, direction, playbackRate, autoplay, kickSync]);

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
  // Forward-facing rewind: §12 restarts "in current direction", so undo any
  // reverse() flip and seek the shared time back to zero — same semantics as
  // the animation hook's reset.
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

  return { state, currentTime, iterationCount, result, play, pause, reverse, reset, cancel };
}
