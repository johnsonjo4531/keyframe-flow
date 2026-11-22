import type * as React from "react";
import type { KeyframePlaybackHandle } from "keyframe-flow/react";

/**
 * Shared story chrome: the transport buttons and live state readout. The
 * playback plumbing itself lives in the library — stories build a handle with
 * `useKeyframePlayback` from `keyframe-flow/react` (T52/T53), and these
 * components render against it.
 */

/** Live readout of playback state for story panels. */
export function Readout({ handle }: { handle: KeyframePlaybackHandle }): React.ReactElement {
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

/** Standard transport buttons wired to a {@link KeyframePlaybackHandle}. */
export function Transport({ handle }: { handle: KeyframePlaybackHandle }): React.ReactElement {
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
