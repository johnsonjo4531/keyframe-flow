import { Animation, target } from "keyframe-flow";
import type { Easing } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * From/to definitions (§5.2): the simplest authoring style — an explicit
 * start transform, an end transform, and a duration in milliseconds.
 */
function FromToStory({
  duration,
  easing,
}: {
  duration: number;
  easing: string;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-120, -40, 0] },
        to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 6] },
        duration,
        easing: easing as Easing,
      }),
    (host) => target.html(host),
    [duration, easing],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 160, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #f97316, #db2777)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/From To",
  component: FromToStory,
  args: { duration: 1200, easing: "ease-in-out" },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    easing: {
      control: "select",
      options: ["linear", "ease", "ease-in", "ease-out", "ease-in-out"],
    },
  },
} satisfies Meta<typeof FromToStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A slide + tilt driven by a plain from/to definition. */
export const SlideAndTilt: Story = {};
