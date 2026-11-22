import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Keyframe definitions (§5.3, §6.1), mirroring the `bounce` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * `at` is normalized progress in `[0, 1]` — fractions of the timeline,
 * independent of `duration` — so re-timing never rewrites keyframes.
 * Validation is eager and strict (§6.3): timestamps must be finite, in range,
 * and strictly increasing. The infinite loop just replays the drop-and-settle.
 */
function KeyframesStory({ duration }: { duration: number }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        duration,
        keyframes: [
          { at: 0, transform: transform().translate(0, -100) }, // starts high
          { at: 0.6, transform: transform() }, // lands at rest by 60 %
          { at: 0.75, transform: transform().translate(0, -30) }, // small rebound
          { at: 0.9, transform: transform() }, // settles again
          { at: 1, transform: transform() }, // holds through the end
        ],
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // replay the drop-and-settle for demo visibility
    makeTarget,
  });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 200, position: "relative" }}>
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
  args: {
    duration: 1200, // the guide's bounce duration
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 8000, step: 100 } },
  },
} satisfies Meta<typeof KeyframesStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's `bounce`: drop, land, rebound, settle — normalized keyframes. */
export const Bounce: Story = {};
