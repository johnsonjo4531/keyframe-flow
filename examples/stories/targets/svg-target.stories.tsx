import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * SVG adapter (§17): writes the SVG 1.1 `transform="matrix(a, b, c, d, e, f)"`
 * attribute mapped from the matrix's column vectors. SVG is inherently 2D
 * affine — Z and perspective members are not expressible here.
 */
function SvgTargetStory({ duration }: { duration: number }): React.ReactElement {
  const [attribute, setAttribute] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-90, 0, 0], scale: 0.6 },
        to: { position: [90, 0, 0], scale: 1.4 },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => {
    const group = host.querySelector("g");
    if (group === null) throw new Error("SVG group missing in story host.");
    return target.svg(group);
  }, []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  useEffect(() => {
    const host = handle.ref.current;
    if (host === null) return;
    const group = host.querySelector("g");
    let raf = 0;
    const poll = (): void => {
      setAttribute(group?.getAttribute("transform") ?? "");
      if (handle.state === "running") raf = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(raf);
  }, [handle]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div ref={handle.ref}>
        <svg width="360" height="140" viewBox="-180 -70 360 140">
          <g>
            <rect x={-28} y={-28} width={56} height={56} rx={10} fill="#f43f5e" />
            <circle cx={20} cy={-20} r={8} fill="#fff" opacity={0.85} />
          </g>
        </svg>
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>{attribute}</code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/SVG Adapter",
  component: SvgTargetStory,
  args: {
    duration: 1400,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof SvgTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The SVG section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * the adapter writes SVG 1.1's `transform="matrix(a, b, c, d, e, f)"` mapped
 * from the matrix's column vectors — live in the attribute readout below.
 * SVG is affine 2D: Z and perspective members cannot be expressed here.
 */
export const MatrixAttribute: Story = {};
