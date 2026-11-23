import { Animation, Timeline, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useRef } from "react";
import { Readout, Transport } from "../playback-story";
import { requireHost, useTimelinePlayback } from "../timeline-story";

/**
 * Parallel composition (§14.1), as shown in the [Timeline guide](https://johnsonjo4531.github.io/keyframe-flow/docs/timeline-choreography/):
 * children start together but keep **independent durations** — nothing is
 * stretched to match anything else. The background ring repeats forever
 * (`iterations: "infinite"`), so the composition's duration is infinite and
 * the run never finishes on its own (§14.3), while the card entrance and the
 * badge slide are finite children that settle into their final states inside
 * the endless scene. Watch the readout: `state` stays `running`.
 */
function ParallelStory({ spinDuration }: { spinDuration: number }): React.ReactElement {
  const ringRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);

  const makeTimeline = useCallback(
    () =>
      Timeline.parallel([
        // An infinite background loop: legal as a parallel child (§14.3) and
        // the reason this composition's duration is Infinity.
        {
          animation: Timeline.repeat(
            Animation.from({ to: { rotation: [0, 0, Math.PI * 2] }, duration: spinDuration }),
            { iterations: "infinite" },
          ),
          target: target.html(requireHost(ringRef)),
        },
        {
          animation: Animation.from({
            from: { position: [-180, 0, 0], scale: 0.7 },
            to: { position: [0, 0, 0] },
            duration: 600,
            easing: "ease-out",
          }),
          target: target.html(requireHost(cardRef)),
        },
        {
          animation: Animation.from({
            from: { position: [0, 90, 0], scale: 0 },
            to: { position: [0, 0, 0] },
            duration: 400,
            easing: "ease-out",
          }),
          target: target.html(requireHost(badgeRef)),
        },
      ]),
    [spinDuration],
  );
  const handle = useTimelinePlayback(makeTimeline, { autoplay: true });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 340, height: 210, position: "relative" }}>
        <div
          ref={ringRef}
          style={{
            position: "absolute",
            left: "calc(50% - 70px)",
            top: "calc(50% - 70px)",
            width: 140,
            height: 140,
            borderRadius: "50%",
            border: "3px dashed #6b7280",
          }}
        />
        <div
          ref={cardRef}
          style={{
            position: "absolute",
            left: "calc(50% - 90px)",
            top: "calc(50% - 40px)",
            width: 180,
            padding: "10px 14px",
            borderRadius: 10,
            background: "linear-gradient(135deg, #0f172a, #1e293b)",
            border: "1px solid #334155",
            color: "#e6e8ee",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 13,
          }}
        >
          Finite entrance inside an endless scene
        </div>
        <div
          ref={badgeRef}
          style={{
            position: "absolute",
            left: "calc(50% + 46px)",
            top: "calc(50% - 58px)",
            padding: "3px 10px",
            borderRadius: 999,
            background: "#f59e0b",
            color: "#111",
            fontFamily: "ui-sans-serif, system-ui, sans-serif",
            fontSize: 12,
            fontWeight: 700,
          }}
        >
          ∞
        </div>
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Timeline/Parallel",
  component: ParallelStory,
  args: { spinDuration: 2400 },
  argTypes: {
    spinDuration: { control: { type: "range", min: 800, max: 6000, step: 200 } },
  },
} satisfies Meta<typeof ParallelStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `Timeline.parallel` starts children together with independent durations (§14.1). */
export const EndlessScene: Story = {};
