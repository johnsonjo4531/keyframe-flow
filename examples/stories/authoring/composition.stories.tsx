import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Composition (§14), mirroring the move/spin/pulse snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * `Animation.combine` merges by property track — each input overrides only
 * the properties it actually animates, no merged keyframes; `Animation.group`
 * sequences children back to back and nests freely (§19). At the default
 * duration the inputs are exactly the guide's: 200 px move + half-turn + 1.4×
 * pulse over half the time.
 */
function CompositionStory({
  duration,
  layout,
}: {
  duration: number;
  layout: "combine" | "sequence" | "parallel";
}): React.ReactElement {
  const animation = useMemo(() => {
    const move = Animation.from({ to: { position: [200, 0, 0] }, duration });
    const spin = Animation.from({ to: { rotation: [0, Math.PI, 0] }, duration });
    const pulse = Animation.from({ to: { scale: 1.4 }, duration: duration / 2 });

    if (layout === "combine") return Animation.combine([move, spin, pulse]);
    if (layout === "parallel") return Animation.group([move, spin, pulse], { layout: "parallel" });
    // Sequence — including a nested group inside the timeline.
    return Animation.group([Animation.group([move, spin]), pulse]);
  }, [duration, layout]);
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 180, position: "relative" }}>
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
            background: "linear-gradient(135deg, #14b8a6, #3b82f6)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Composition",
  component: CompositionStory,
  args: {
    duration: 1000, // the guide's move/spin length; pulse is half (§5 snippet)
    layout: "combine",
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    layout: { control: "inline-radio", options: ["combine", "sequence", "parallel"] },
  },
} satisfies Meta<typeof CompositionStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Move + rotate + scale authored as three independent animations. */
export const CombineTracks: Story = {};
