import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Rotation interpolation (§9), mirroring the `spin` snippet in the
 * [Easing & interpolation guide](https://johnsonjo4531.github.io/keyframe-flow/docs/easing-interpolation/):
 * 0 → 2π about Y over 1000 ms. In the default quaternion mode the endpoints
 * are the same orientation, so SLERP collapses the turn to nothing; with
 * `rotationMode: "angular"` the authored Euler radians interpolate
 * component-wise — a visible full revolution, no intermediate keyframes.
 * Switch the `mode` arg to compare. Raw element-wise matrix lerp is never
 * the default (§9.2).
 */
function InterpolationStory({ mode }: { mode: "quaternion" | "angular" }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: { rotation: [0, 0, 0] },
        to: { rotation: [0, Math.PI * 2, 0] }, // one full turn about Y
        duration: 1000, // the guide's spin duration
        rotationMode: mode,
      }),
    [mode],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 180, perspective: 600, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 88,
            height: 88,
            marginLeft: -44,
            marginTop: -44,
            borderRadius: 12,
            // Asymmetric face so the rotation is visible.
            background: "linear-gradient(90deg, #f59e0b 50%, #1d4ed8 50%)",
          }}
        />
      </div>
      <p style={{ maxWidth: 420, fontSize: 13, textAlign: "center" }}>
        {mode === "quaternion"
          ? "Quaternion mode: both endpoints are the same orientation — SLERP finds nothing to do."
          : "Angular mode: authored Euler radians interpolate component-wise — a visible full revolution."}
      </p>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Interpolation/SLERP vs Angular",
  component: InterpolationStory,
  args: {
    mode: "angular",
  },
  argTypes: {
    mode: { control: "inline-radio", options: ["quaternion", "angular"] },
  },
} satisfies Meta<typeof InterpolationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Toggle between quaternion (shortest path) and angular (full turn). */
export const FullRevolution: Story = {};
