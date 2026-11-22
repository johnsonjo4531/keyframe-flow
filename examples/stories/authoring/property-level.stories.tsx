import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Property-level definitions (§7), mirroring the `grow` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * no `from` at all — the start is documented identity — and only `scale` is
 * animated, so position and rotation are untouched property tracks. The loop
 * options exist only to keep the 250 ms snippet visible between replays.
 */
function PropertyLevelStory({
  duration,
  toScale,
}: {
  duration: number;
  toScale: number;
}): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        // No `from`: starts from identity (§7). Only scale changes.
        to: { scale: toScale },
        duration,
      }),
    [duration, toScale],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // loop the short snippet for demo visibility
    direction: "alternate",
    makeTarget,
  });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 160, position: "relative" }}>
        <div
          ref={handle.ref}
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
  args: {
    duration: 250, // the guide's grow duration
    toScale: 1.5,
  },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
    toScale: { control: { type: "range", min: 0.2, max: 3, step: 0.1 } },
  },
} satisfies Meta<typeof PropertyLevelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's `grow`: scale 1 → 1.5 from identity — position/rotation untouched. */
export const ScaleOnly: Story = {};
