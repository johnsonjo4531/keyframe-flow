import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * From/to definitions (§5.2), mirroring the `fadeUp` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * an explicit start transform (`transform().translate(0, 20)`), an end
 * transform (identity), and a duration of 300 ms. The definition is immutable
 * and reusable; everything below it — playback, transport, readout — is demo
 * chrome. `iterations: "infinite"` with `direction: "alternate"` only loops
 * the short snippet so it stays visible without pressing play again.
 */
function FromToStory({ duration }: { duration: number }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: transform().translate(0, 20), // start 20 px below the end pose
        to: transform(), // identity — where everything ends up
        duration, // milliseconds; finite and non-negative (§6.2)
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // loop the 300 ms snippet for demo visibility
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
  args: {
    duration: 300, // the guide's fadeUp duration
  },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof FromToStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's `fadeUp`: identity → up-and-settle over an explicit from/to. */
export const FadeUp: Story = {};
