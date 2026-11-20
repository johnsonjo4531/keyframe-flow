import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Property-level definitions (§7): specify only the properties that change —
 * everything else is preserved from the start transform. Here only `scale`
 * animates; position and rotation stay exactly as authored.
 */
function PropertyLevelStory({
  duration,
  toScale,
}: {
  duration: number;
  toScale: number;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-60, 20, 0], rotation: [0, 0, -Math.PI / 8] },
        to: { scale: toScale }, // only scale changes (§7)
        duration,
      }),
    (host) => target.html(host),
    [duration, toScale],
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
            background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Property Level",
  component: PropertyLevelStory,
  args: { duration: 900, toScale: 1.8 },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    toScale: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
  },
} satisfies Meta<typeof PropertyLevelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A scale-only animation over a non-identity start transform. */
export const ScaleOnly: Story = {};
