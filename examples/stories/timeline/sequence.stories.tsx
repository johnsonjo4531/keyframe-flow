import { Animation, Timeline, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useRef } from "react";
import { Readout, Transport } from "../playback-story";
import { requireHost, useTimelinePlayback } from "../timeline-story";

/** Shared row style for the entrance elements. */
const rowStyle: React.CSSProperties = {
  position: "absolute",
  left: 20,
  padding: "6px 14px",
  borderRadius: 8,
  color: "#e6e8ee",
  fontFamily: "ui-sans-serif, system-ui, sans-serif",
  fontSize: 13,
  fontWeight: 600,
};

/**
 * Sequence composition (§14.1), as walked through in the [Timeline guide](https://johnsonjo4531.github.io/keyframe-flow/docs/timeline-choreography/):
 * three rows enter back to back — each starts after the preceding child's
 * *intrinsic* duration plus the gap. Children keep their own durations;
 * `sequence` places them, it never re-times them. Watch the readout: shared
 * timeline time runs straight through while each row animates only inside its
 * own window (350 ms + gap + 450 ms + gap + 300 ms).
 */
function SequenceStory({ gap }: { gap: number }): React.ReactElement {
  const logoRef = useRef<HTMLDivElement>(null);
  const headingRef = useRef<HTMLDivElement>(null);
  const subtitleRef = useRef<HTMLDivElement>(null);

  const makeTimeline = useCallback(
    () =>
      Timeline.sequence(
        [
          {
            animation: Animation.from({
              from: { position: [-240, 0, 0] },
              to: { position: [0, 0, 0] },
              duration: 350,
              easing: "ease-out",
            }),
            target: target.html(requireHost(logoRef)),
          },
          {
            animation: Animation.from({
              from: { position: [-240, 0, 0], scale: 0.9 },
              to: { position: [0, 0, 0] },
              duration: 450,
              easing: "ease-out",
            }),
            target: target.html(requireHost(headingRef)),
          },
          {
            animation: Animation.from({
              from: { position: [-240, 0, 0], scale: 0.8 },
              to: { position: [0, 0, 0] },
              duration: 300,
              easing: "ease-in-out",
            }),
            target: target.html(requireHost(subtitleRef)),
          },
        ],
        { gap },
      ),
    [gap],
  );
  const handle = useTimelinePlayback(makeTimeline, { autoplay: true });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 380, height: 190, position: "relative" }}>
        <div
          ref={logoRef}
          style={{
            ...rowStyle,
            top: "calc(50% - 62px)",
            background: "linear-gradient(135deg, #f59e0b, #ef4444)",
          }}
        >
          LOGO
        </div>
        <div
          ref={headingRef}
          style={{
            ...rowStyle,
            top: "calc(50% - 14px)",
            background: "linear-gradient(135deg, #14b8a6, #3b82f6)",
          }}
        >
          Heading enters second
        </div>
        <div
          ref={subtitleRef}
          style={{
            ...rowStyle,
            top: "calc(50% + 34px)",
            background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
          }}
        >
          …subtitle last
        </div>
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Timeline/Sequence",
  component: SequenceStory,
  args: { gap: 120 },
  argTypes: {
    gap: { control: { type: "range", min: 0, max: 600, step: 20 } },
  },
} satisfies Meta<typeof SequenceStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `Timeline.sequence` places children back to back by their own durations (§14.1). */
export const Entrance: Story = {};
