import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Static keyframes (§5.3): `at` is normalized progress in `[0, 1]` (§6.1),
 * so re-timing only changes `duration`. Timestamps must be strictly
 * increasing — duplicates and reordering throw at definition time (§6.3).
 */
function KeyframesStory({ duration }: { duration: number }): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        duration,
        easing: "ease-in-out", // default for segments without an override (§8)
        keyframes: [
          { at: 0, transform: { position: [-140, -50, 0] } },
          { at: 0.35, transform: { position: [140, -50, 0], rotation: [0, 0, Math.PI / 4] } },
          { at: 0.7, transform: { position: [140, 50, 0], rotation: [0, 0, -Math.PI / 4] } },
          { at: 1, transform: { position: [-140, 50, 0] } },
        ],
      }),
    (host) => target.html(host),
    [duration],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 200, position: "relative" }}>
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
            background: "linear-gradient(135deg, #a855f7, #6366f1)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Keyframes",
  component: KeyframesStory,
  args: { duration: 2000 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 8000, step: 100 } },
  },
} satisfies Meta<typeof KeyframesStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A four-keyframe zig-zag path with orientation changes. */
export const ZigZag: Story = {};
