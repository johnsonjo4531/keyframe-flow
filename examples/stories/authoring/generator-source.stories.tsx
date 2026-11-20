import { Animation, target } from "keyframe-flow";
import type { TransformKeyframe } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/** Generator keyframes (§5.4): any synchronous iterable works (§5.3). */
function* orbitKeyframes(samples: number): Generator<TransformKeyframe> {
  for (let i = 0; i <= samples; i++) {
    const t = i / samples;
    const angle = t * Math.PI * 2;
    yield {
      at: t,
      transform: {
        position: [Math.cos(angle) * 110, Math.sin(angle) * 70, 0],
        rotation: [0, 0, angle], // keep the box facing along the path
      },
    };
  }
}

/**
 * Generator sources (§5.4–§5.5): `Animation.from` consumes the iterable
 * eagerly and exactly once at definition time — playback afterwards reads a
 * frozen shared timeline, so generators never re-run per frame.
 */
function GeneratorStory({
  duration,
  samples,
}: {
  duration: number;
  samples: number;
}): React.ReactElement {
  const handle = useKeyframePlayback(
    () => Animation.from({ duration, keyframes: orbitKeyframes(samples) }),
    (host) => target.html(host),
    [duration, samples],
  );

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 200, position: "relative" }}>
        <div
          ref={handle.hostRef}
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
  args: { duration: 3000, samples: 24 },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 8000, step: 100 } },
    samples: { control: { type: "range", min: 4, max: 64, step: 2 } },
  },
} satisfies Meta<typeof GeneratorStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** An elliptical orbit generated from a factory function. */
export const Orbit: Story = {};
