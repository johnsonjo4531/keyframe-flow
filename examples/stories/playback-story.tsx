import { useCallback, useEffect, useRef, useState } from "react";
import type * as React from "react";
import type {
  Animation,
  Playback,
  PlaybackOptions,
  PlaybackResult,
  PlaybackState,
  RenderTarget,
} from "keyframe-flow";

/** What {@link useKeyframePlayback} hands a story: refs, live state, controls. */
export interface PlaybackStoryHandle {
  /** Attach this ref to the host element the render target is built from. */
  hostRef: React.RefObject<HTMLDivElement | null>;
  state: PlaybackState;
  currentTime: number;
  iterationCount: number;
  result: PlaybackResult | undefined;
  playbackRef: React.MutableRefObject<Playback | undefined>;
  play(): void;
  pause(): void;
  reverse(): void;
  /** Rewind to progress 0 facing forward, so the next `play()` runs 0 → 1. */
  reset(): void;
  cancel(): void;
  seekProgress(p: number): void;
}

/**
 * Shared story plumbing: builds an animation + render target, attaches a
 * playback, re-attaches whenever `deps` change (duration, easing, …), mirrors
 * the live state for display, and disposes on unmount (§12 — disposal never
 * destroys the host element or canvas).
 */
export function useKeyframePlayback(
  buildAnimation: () => Animation,
  makeTarget: (host: HTMLElement) => RenderTarget,
  deps: readonly unknown[],
  makeOptions?: () => PlaybackOptions,
): PlaybackStoryHandle {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const playbackRef = useRef<Playback | undefined>(undefined);
  const [state, setState] = useState<PlaybackState>("idle");
  const [currentTime, setCurrentTime] = useState(0);
  const [iterationCount, setIterationCount] = useState(0);
  const [result, setResult] = useState<PlaybackResult | undefined>(undefined);

  // Keep the latest builder/target factory without re-running the effect.
  const buildRef = useRef(buildAnimation);
  buildRef.current = buildAnimation;
  const targetRef = useRef(makeTarget);
  targetRef.current = makeTarget;
  const optionsRef = useRef(makeOptions);
  optionsRef.current = makeOptions;

  // Mirror live playback state on frames while a run is live (Playback
  // exposes no event bus, §12), and re-kick whenever a control is pressed:
  // the loop stops as soon as playback is not running, so without a kick a
  // discrete action (play after finish, reset, seek) would leave the readout
  // stale. One rAF handle for the whole hook lifetime.
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
    const host = hostRef.current;
    if (host === null) return;

    setResult(undefined);
    const playback = buildRef.current().attach(targetRef.current(host), {
      autoplay: true, // stories animate immediately unless the caller opts out
      ...optionsRef.current?.(),
    });
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
  }, [...deps, kickSync]);

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
  const seekProgress = useCallback(
    (p: number) => {
      playbackRef.current?.seekProgress(p);
      kickSync();
    },
    [kickSync],
  );

  return {
    hostRef,
    state,
    currentTime,
    iterationCount,
    result,
    playbackRef,
    play,
    pause,
    reverse,
    reset,
    cancel,
    seekProgress,
  };
}

/** Live readout of playback state for story panels. */
export function Readout({ handle }: { handle: PlaybackStoryHandle }): React.ReactElement {
  return (
    <div
      style={{
        fontFamily: "ui-monospace, monospace",
        fontSize: 12,
        marginTop: 12,
        display: "flex",
        gap: 16,
        flexWrap: "wrap",
      }}
    >
      <span>
        state: <b>{handle.state}</b>
      </span>
      <span>t = {handle.currentTime.toFixed(0)} ms</span>
      <span>iteration #{handle.iterationCount + 1}</span>
      {handle.result !== undefined && <span>finished: {handle.result.status}</span>}
    </div>
  );
}

/** Standard transport buttons wired to a {@link PlaybackStoryHandle}. */
export function Transport({ handle }: { handle: PlaybackStoryHandle }): React.ReactElement {
  const button = { padding: "4px 10px", cursor: "pointer" } as const;
  return (
    <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
      <button type="button" style={button} onClick={() => handle.play()}>
        play
      </button>
      <button type="button" style={button} onClick={() => handle.pause()}>
        pause
      </button>
      <button type="button" style={button} onClick={() => handle.reset()}>
        reset
      </button>
      <button type="button" style={button} onClick={() => handle.reverse()}>
        reverse
      </button>
      <button type="button" style={button} onClick={() => handle.cancel()}>
        cancel
      </button>
    </div>
  );
}
