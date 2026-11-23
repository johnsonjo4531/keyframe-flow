import type * as React from "react";
import type { PlaybackResult, PlaybackState } from "keyframe-flow";

/**
 * Shared story chrome: the transport buttons and live state readout. The
 * playback plumbing itself lives in the library — animation stories build a
 * handle with `useKeyframePlayback` from `keyframe-flow/react` (T52/T53) and
 * Timeline stories with the story-side `useTimelinePlayback` twin — and these
 * components render against either, so they stay structurally typed.
 */

/** Structural view of any playback handle the chrome can drive. */
export interface PlaybackHandleLike {
  readonly state: PlaybackState;
  readonly currentTime: number;
  readonly iterationCount: number;
  readonly result: PlaybackResult | undefined;
  play(): void;
  pause(): void;
  reset(): void;
  reverse(): void;
  cancel(): void;
}

/** Live readout of playback state for story panels. */
export function Readout({ handle }: { handle: PlaybackHandleLike }): React.ReactElement {
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

/** Standard transport buttons wired to a {@link PlaybackHandleLike}. */
export function Transport({ handle }: { handle: PlaybackHandleLike }): React.ReactElement {
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
