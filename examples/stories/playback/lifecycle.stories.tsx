import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Playback & lifecycle (§11–§13): independent `Playback` state machine with
 * transport controls and scrubbing. State readout shows §12 transitions live;
 * `finished` resolves `finished | cancelled` and never rejects.
 */
function LifecycleStory({
  duration,
  seek,
}: {
  duration: number;
  seek: number;
}): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-130, 0, 0], rotation: [0, 0, -Math.PI / 3] },
        to: { position: [130, 0, 0], rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  // Scrub via seekProgress — clamped to [0, 1] by the engine (§12).
  useEffect(() => {
    handle.seekProgress(seek);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seek]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 140, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #ec4899, #8b5cf6)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Playback/Lifecycle",
  component: LifecycleStory,
  args: {
    duration: 1500,
    seek: 0,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 6000, step: 100 } },
    seek: { control: { type: "range", min: 0, max: 1, step: 0.01 } },
  },
} satisfies Meta<typeof LifecycleStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The state machine from the
 * [Playback & lifecycle guide](https://johnsonjo4531.github.io/keyframe-flow/docs/playback-lifecycle/):
 * drive every transition of §12 yourself — `idle → running ⇄ paused →
 * finished | cancelled` — with a live readout of `state`, `currentTime`
 * (elapsed animation time within the iteration, not wall clock), and
 * iteration. The scrubber shows `seek(ms)` / `seekProgress(p)` clamping, and
 * `finished` always resolves with a status object, never rejects.
 */
export const TransportControls: Story = {};
