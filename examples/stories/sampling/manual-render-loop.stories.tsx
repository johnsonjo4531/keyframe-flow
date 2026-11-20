import { Animation } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Manual sampling in an external render loop (§10.3): no `attach`, no
 * playback instance, no scheduler — the host owns time and calls
 * `sampleProgress` each frame with its own progress value.
 */
function ManualLoopStory({ duration }: { duration: number }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    const animation = Animation.from({
      from: { position: [-1, 0, 0], scale: 0.6 },
      to: { position: [1, 0, 0], scale: 1.3 },
      duration,
      easing: "ease-in-out",
    });

    let raf = 0;
    const start = performance.now();
    const draw = (now: number): void => {
      const progress = ((now - start) % duration) / duration; // host-owned time
      const transform = animation.sampleProgress(progress); // §10.2 — pure evaluation
      const { position, scale } = transform.components;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(
        w / 2 + position.x * (w / 2 - 60),
        h / 2 + Math.sin(progress * Math.PI * 2) * 40,
      );
      ctx.scale(scale.x, scale.y);
      ctx.fillStyle = "#10b981";
      ctx.fillRect(-24, -24, 48, 48);
      ctx.restore();

      // The same timeline sampled as text — sampling is just a function call.
      ctx.font = "12px ui-monospace, monospace";
      ctx.fillStyle = "#999";
      ctx.fillText(
        `progress ${progress.toFixed(2)} → x ${position.x.toFixed(2)}, scale ${scale.x.toFixed(2)}`,
        8,
        h - 10,
      );

      raf = requestAnimationFrame(draw);
    };

    if (running) raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [duration, running]);

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <canvas ref={canvasRef} width={480} height={220} style={{ maxWidth: "100%" }} />
      <label style={{ fontSize: 13 }}>
        <input type="checkbox" checked={running} onChange={(e) => setRunning(e.target.checked)} />{" "}
        host loop running
      </label>
    </div>
  );
}

const meta = {
  title: "Sampling/Manual Render Loop",
  component: ManualLoopStory,
  args: { duration: 2000 },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 6000, step: 100 } },
  },
} satisfies Meta<typeof ManualLoopStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** A host-owned rAF loop sampling the same timeline every frame. */
export const ExternalLoop: Story = {};
