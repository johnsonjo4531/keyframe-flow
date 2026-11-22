import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * HTML adapter (§17): writes CSS `matrix3d()` values in column-major order.
 * The adapter owns the inline `transform` property — any pre-existing value
 * is replaced on the first evaluated frame (§17.3).
 */
function HtmlTargetStory({
  duration,
  origin,
}: {
  duration: number;
  origin: string;
}): React.ReactElement {
  const [lastTransform, setLastTransform] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-100, -30, 0], rotation: [0, 0, 0] },
        to: { position: [100, 30, 0], rotation: [0, 0, Math.PI / 4] },
        duration,
        easing: "ease-in-out",
      }),
    [duration, origin],
  );
  const makeTarget = useCallback(
    (host: HTMLElement) =>
      target.html(host, origin === "default" ? undefined : { transformOrigin: origin }),
    [origin],
  );
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  // Reflect the CSS the adapter actually wrote — browser-parsed truth.
  useEffect(() => {
    const host = handle.ref.current;
    if (host === null) return;
    let raf = 0;
    const poll = (): void => {
      setLastTransform(host.style.transform.slice(0, 64));
      if (handle.state === "running") raf = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(raf);
  }, [handle]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 160, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
          }}
        />
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>{lastTransform}…</code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/HTML Adapter",
  component: HtmlTargetStory,
  args: {
    duration: 1400,
    origin: "default",
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    origin: { control: "select", options: ["default", "0 0", "center bottom"] },
  },
} satisfies Meta<typeof HtmlTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The HTML adapter section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * every frame writes a CSS `matrix3d()` value in column-major order, and the
 * readout shows the exact string landing on the element. The adapter owns the
 * inline `transform` property; switch `origin` to see how transform-origin
 * interacts with the matrix (§17.3).
 */
export const Matrix3D: Story = {};
