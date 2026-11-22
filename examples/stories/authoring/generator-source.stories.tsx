import { Animation, target, transform } from "keyframe-flow";
import type { TransformKeyframe } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/** The guide's `orbitKeyframes`: a circle of radius 80, one keyframe per step. */
function* orbitKeyframes(count: number): Generator<TransformKeyframe> {
  for (let i = 0; i <= count; i++) {
    const angle = (i / count) * Math.PI * 2;
    yield {
      at: i / count,
      transform: transform().translate(Math.cos(angle) * 80, Math.sin(angle) * 80),
    };
  }
}

/**
 * Generator sources (§5.4–§5.5), mirroring the `orbit` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * any synchronous iterable is a keyframe source, consumed eagerly and exactly
 * once when `Animation.from()` runs — playback afterwards reads a frozen
 * shared timeline, so the generator never re-runs per frame.
 */
function GeneratorStory({
  duration,
  samples,
}: {
  duration: number;
  samples: number;
}): React.ReactElement {
  const animation = useMemo(
    () => Animation.from({ duration, keyframes: orbitKeyframes(samples) }),
    [duration, samples],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 200, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 48,
            height: 48,
            marginLeft: -24,
            marginTop: -24,
            borderRadius: 8,
            background: "linear-gradient(135deg, #eab308, #ef4444)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/Generator Source",
  component: GeneratorStory,
  args: {
    duration: 4000, // the guide's orbit duration
    samples: 24,
  },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 8000, step: 100 } },
    samples: { control: { type: "range", min: 4, max: 64, step: 2 } },
  },
} satisfies Meta<typeof GeneratorStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's `orbit`: 24 circular keyframes produced by a generator function. */
export const Orbit: Story = {};
