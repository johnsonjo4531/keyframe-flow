import { Animation, target } from "keyframe-flow";
import type { PlaybackDirectionMode } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

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
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-140, 0, 0] },
        to: { position: [140, 0, 0], scale: 1.5 },
        duration,
        easing: "ease-in-out",
      }),
    (host) => target.html(host),
    [duration, iterations, direction], // any option change re-attaches
    () => ({ iterations, direction }),
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 140, position: "relative" }}>
        <div
          ref={handle.hostRef}
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

/** Three alternating back-and-forth passes. */
export const AlternateThrice: Story = {};

/** Never-ending alternate ping-pong — `finished` stays pending (§12). */
export const InfiniteAlternate: Story = {
  args: { iterations: "infinite", direction: "alternate" },
};
