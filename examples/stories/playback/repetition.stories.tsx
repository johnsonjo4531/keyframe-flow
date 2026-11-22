import { Animation, target } from "keyframe-flow";
import type { PlaybackDirectionMode } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Repetition & direction (§13): iteration counts (finite or infinite) and
 * direction modes are handled by the engine loop — keyframes are never
 * duplicated, and multiple boundaries can cross in one frame without losing
 * sync. Changing an option re-attaches a fresh playback (§11 options are set
 * at attach time).
 */
function RepetitionStory({
  duration,
  iterations,
  direction,
}: {
  duration: number;
  iterations: number | "infinite";
  direction: PlaybackDirectionMode;
}): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-140, 0, 0] },
        to: { position: [140, 0, 0], scale: 1.5 },
        duration,
        easing: "ease-in-out",
      }),
    [duration, iterations, direction],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    makeTarget,
    iterations,
    direction,
  });

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
            background: "linear-gradient(135deg, #f97316, #eab308)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Playback/Repetition & Direction",
  component: RepetitionStory,
  args: {
    duration: 1000,
    iterations: 3 as number | "infinite",
    direction: "alternate" as PlaybackDirectionMode,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 4000, step: 100 } },
    iterations: { control: { type: "number", min: 1 } },
    direction: {
      control: "inline-radio",
      options: ["normal", "reverse", "alternate", "alternate-reverse"],
    },
  },
} satisfies Meta<typeof RepetitionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The §13 example from the
 * [Playback & lifecycle guide](https://johnsonjo4531.github.io/keyframe-flow/docs/playback-lifecycle/):
 * three `direction: "alternate"` iterations — forward, back, forward — with
 * the iteration counter visible. Repetition is an engine-loop concern; the
 * keyframes are never duplicated.
 */
export const AlternateThrice: Story = {};

/**
 * The guide's `pendulum` shape: `iterations: "infinite"` with
 * `direction: "alternate"` never completes, so `finished` stays pending until
 * cancel or dispose — see the
 * [repetition section](https://johnsonjo4531.github.io/keyframe-flow/docs/playback-lifecycle/).
 */
export const InfiniteAlternate: Story = {
  args: { iterations: "infinite", direction: "alternate" },
};
