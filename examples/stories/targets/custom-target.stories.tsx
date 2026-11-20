import { Animation } from "keyframe-flow";
import type { Matrix4, RenderTarget } from "keyframe-flow";
import type * as React from "react";
import { useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Custom structural target (§17.1): any object with `setTransform(matrix)`
 * is a valid render target — no base class, no library imports inside the
 * renderer, zero engine changes. This recorder stores every evaluated matrix
 * and renders one itself; disposal leaves it fully intact (§17.2).
 */
function CustomTargetStory({ duration }: { duration: number }): React.ReactElement {
  const [frames, setFrames] = useState(0);
  const [latest, setLatest] = useState<Matrix4 | undefined>(undefined);
  const recorder = useMemo<RenderTarget & { frames: number }>(() => {
    const targetObject = {
      frames: 0,
      setTransform(matrix: Matrix4): void {
        targetObject.frames += 1;
        // React state updates from the engine's frame callback are fine here.
        queueMicrotask(() => {
          setFrames(targetObject.frames);
          setLatest(matrix);
        });
      },
    };
    return targetObject;
  }, []);

  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-120, -40, 0] },
        to: { position: [120, 40, 0], rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    () => recorder,
    [duration, recorder],
  );

  // Column-major storage: translation lives at indices 12–14 (§15). The
  // custom target receives raw matrices — reading elements directly is the
  // host's job.
  const x = latest?.at(0, 3);
  const y = latest?.at(1, 3);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 160, position: "relative" }}>
        <div
          ref={handle.hostRef} // host only for layout; the custom target ignores it
          style={{
            position: "absolute",
            left: `calc(50% + ${(x ?? -120).toFixed(1)}px)`,
            top: `calc(50% + ${(y ?? -40).toFixed(1)}px)`,
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: "50%",
            background: "linear-gradient(135deg, #facc15, #fb7185)",
          }}
        />
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>
        setTransform calls: {frames} — matrices recorded by the custom target
      </code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/Custom Structural Target",
  component: CustomTargetStory,
  args: { duration: 1600 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof CustomTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A plain object target receiving evaluated matrices per frame. */
export const MatrixRecorder: Story = {};
