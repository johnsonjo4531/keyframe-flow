import { Animation } from "keyframe-flow";
import type { EasingName } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";

const NAMES: EasingName[] = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "ease-in-sine",
  "ease-out-sine",
  "ease-in-out-sine",
  "ease-in-quad",
  "ease-out-quad",
  "ease-in-out-quad",
  "ease-in-cubic",
  "ease-out-cubic",
  "ease-in-out-cubic",
  "ease-in-quart",
  "ease-out-quart",
  "ease-in-out-quart",
  "ease-in-quint",
  "ease-out-quint",
  "ease-in-out-quint",
  "ease-in-expo",
  "ease-out-expo",
  "ease-in-out-expo",
  "ease-in-circ",
  "ease-out-circ",
  "ease-in-out-circ",
];

/** Custom easing — no registration required (§8). */
const overshoot = (t: number): number => {
  const c = 1.70158;
  const u = t - 1;
  return u * u * ((c + 1) * u + c) + 1;
};

/**
 * Easing (§8): every named curve plus custom functions. The curve plot is
 * produced by manual sampling (§10) — `sampleProgress` over a zero-to-one
 * animation of the easing itself.
 */
function EasingGalleryStory({
  name,
  custom,
}: {
  name: EasingName;
  custom: boolean;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    // A pure-sampling demo: no playback, no scheduler, no render target.
    const probe = Animation.from({
      from: { position: [0, 0, 0] },
      to: { position: [1, 0, 0] },
      duration: 1,
      easing: custom ? overshoot : name,
    });

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#8884";
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    ctx.beginPath();
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const eased = probe.sampleProgress(t).components.position.x; // ∈ [0,1] (+overshoot)
      const x = t * w;
      const y = h - eased * (h - 8) - 4; // flip Y for screen space
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [name, custom]);

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <canvas ref={canvasRef} width={480} height={200} style={{ maxWidth: "100%" }} />
      <code style={{ fontSize: 12 }}>
        easing: {custom ? "(custom function — easeOutBack)" : JSON.stringify(name)}
      </code>
    </div>
  );
}

const meta = {
  title: "Easing/Easing Gallery",
  component: EasingGalleryStory,
  args: { name: "ease-in-out-cubic" as EasingName, custom: false },
  argTypes: {
    name: { control: "select", options: NAMES },
    custom: { control: "boolean" },
  },
} satisfies Meta<typeof EasingGalleryStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Plot any of the 26 named curves, or a custom easing function. */
export const Curves: Story = {};
