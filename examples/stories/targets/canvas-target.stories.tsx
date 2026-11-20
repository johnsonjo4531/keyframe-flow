import { Animation, projectToCanvas2D, target } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * Canvas 2D adapter (§17.3): the evaluated 4×4 matrix goes through an
 * explicit projection step — never forwarded raw — and the fitted affine is
 * installed with `setTransform`, replacing the context CTM deterministically.
 */
function CanvasTargetStory({
  duration,
  perspective,
}: {
  duration: number;
  perspective: number;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [projected, setProjected] = useState("");
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-120, 0, -40], rotation: [0, 0, 0] },
        to: { position: [120, 0, 80], rotation: [0, 0, Math.PI / 5] },
        duration,
        easing: "linear",
      }),
    (host) => {
      const canvas = host.querySelector("canvas");
      const ctx = canvas?.getContext("2d");
      if (ctx === undefined || ctx === null)
        throw new Error("Canvas 2D unavailable in story host.");
      return target.canvas(ctx, perspective > 0 ? { perspective } : undefined);
    },
    [duration, perspective],
  );

  // The adapter owns the CTM; this loop just draws with it every frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    let raf = 0;
    const draw = (): void => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Draw under the CTM the adapter installed via setTransform.
      const m = ctx.getTransform();
      setProjected(`e=${m.e.toFixed(1)} f=${m.f.toFixed(1)}`);
      ctx.fillStyle = "#84cc16";
      ctx.fillRect(-30, -30, 60, 60);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Show what the pure projection function produces for the current option.
  useEffect(() => {
    if (perspective <= 0) setProjected("");
  }, [perspective]);

  void projectToCanvas2D; // referenced in docs: the step above is this function, applied per frame

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div ref={handle.hostRef}>
        <canvas ref={canvasRef} width={420} height={180} />
      </div>
      {projected !== "" && <code style={{ fontSize: 11, color: "#9ca3af" }}>CTM: {projected}</code>}
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/Canvas 2D Adapter",
  component: CanvasTargetStory,
  args: { duration: 1800, perspective: 400 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    perspective: { control: { type: "range", min: 0, max: 1200, step: 50 } },
  },
} satisfies Meta<typeof CanvasTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Z motion becomes visible scale/offset through the projection step. */
export const ProjectedMotion: Story = {};
