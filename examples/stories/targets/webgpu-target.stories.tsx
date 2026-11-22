import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * WebGPU adapter (§3.6): like the WebGL adapter it creates no GPU resources —
 * each evaluated frame hands the host a column-major `Float32Array` through
 * `onTransform`, ready for `queue.writeBuffer`. This story stays device-free
 * (no `navigator.gpu` needed): the upload path is just an array callback, so
 * the panel shows exactly what would be written into the uniform buffer.
 */
function WebGPUSubmitStory({ duration }: { duration: number }): React.ReactElement {
  const [written, setWritten] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-100, -30, 0], scale: 0.6 },
        to: { position: [100, 30, 0], rotation: [0, Math.PI / 4, 0] },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback(
    () =>
      target.webgpu({
        onTransform: (values) => {
          // In a real renderer: device.queue.writeBuffer(uniforms, 0, values).
          setWritten(Array.from(values.slice(12, 15), (v) => v.toFixed(1)).join(", "));
        },
      }),
    [],
  );
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    // hostRef is required by useKeyframePlayback (it builds the playback from
    // a mounted host) but layout-only here — the WebGPU target ignores it.
    <div ref={handle.ref} style={{ display: "grid", justifyItems: "center" }}>
      <div
        style={{
          width: 320,
          height: 160,
          display: "grid",
          placeItems: "center",
          border: "1px dashed #6b728055",
          borderRadius: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "#9ca3af" }}>
          uniform buffer translation: [{written}]
        </span>
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/WebGPU Adapter",
  component: WebGPUSubmitStory,
  args: {
    duration: 1600,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof WebGPUSubmitStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The WebGPU section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * same contract as WebGL — no device, no buffers created by the library — a
 * column-major `Float32Array` per frame ready for `queue.writeBuffer`. The
 * panel prints exactly what would be written, so the example runs without
 * `navigator.gpu` support.
 */
export const UniformWrite: Story = {};
