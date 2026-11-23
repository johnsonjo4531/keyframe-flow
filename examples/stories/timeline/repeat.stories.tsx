import { Animation, Timeline, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useRef } from "react";
import { Readout, Transport } from "../playback-story";
import { requireHost, useTimelinePlayback } from "../timeline-story";

/**
 * Repetition (§13.1, §14.2), as explained in the [Timeline guide](https://johnsonjo4531.github.io/keyframe-flow/docs/timeline-choreography/):
 * one consistent options shape — `iterations` counts **total** iterations
 * including the first, `direction: "alternate"` ping-pongs progress without
 * snapping back to the start between passes, and `delay` is a gap *between*
 * iterations that never delays the first. `Timeline.repeat` wraps its child in
 * a single compact entry — it is never expanded into copies — so repeating a
 * whole sequence stays cheap and outer repeats compose with child repeats.
 */
function RepeatStory({
  layout,
  iterations,
  delay,
}: {
  layout: "pulse" | "choreography";
  iterations: number;
  delay: number;
}): React.ReactElement {
  const dotRef = useRef<HTMLDivElement>(null);
  const aRef = useRef<HTMLDivElement>(null);
  const bRef = useRef<HTMLDivElement>(null);

  const makeTimeline = useCallback(() => {
    if (layout === "pulse") {
      // Alternate: progress ping-pongs, so the pulse never snaps to the start.
      return Timeline.repeat(
        {
          animation: Animation.from({ from: { scale: 1 }, to: { scale: 2.2 }, duration: 500 }),
          target: target.html(requireHost(dotRef)),
        },
        { iterations, direction: "alternate" },
      );
    }
    // A repeated *sequence*: the whole two-step choreography runs again after
    // a delay gap, held at its terminal values while the gap elapses (§13.1).
    const choreography = Timeline.sequence([
      {
        animation: Animation.from({
          from: { position: [-150, 0, 0] },
          to: { position: [0, 0, 0] },
          duration: 260,
        }),
        target: target.html(requireHost(aRef)),
      },
      {
        animation: Animation.from({
          from: { position: [0, 0, 0] },
          to: { position: [150, 0, 0] },
          duration: 260,
        }),
        target: target.html(requireHost(bRef)),
      },
    ]);
    return Timeline.repeat(choreography, { iterations, delay });
  }, [layout, iterations, delay]);

  const handle = useTimelinePlayback(makeTimeline, { autoplay: true });

  const pulse = layout === "pulse";
  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 380, height: 150, position: "relative" }}>
        {pulse ? (
          <div
            ref={dotRef}
            style={{
              position: "absolute",
              left: "calc(50% - 20px)",
              top: "calc(50% - 20px)",
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "linear-gradient(135deg, #f59e0b, #ef4444)",
            }}
          />
        ) : (
          <>
            <div
              ref={aRef}
              style={{
                position: "absolute",
                left: "calc(50% - 24px)",
                top: "calc(50% - 38px)",
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg, #14b8a6, #3b82f6)",
              }}
            />
            <div
              ref={bRef}
              style={{
                position: "absolute",
                left: "calc(50% - 24px)",
                top: "calc(50% + 2px)",
                width: 36,
                height: 36,
                borderRadius: 8,
                background: "linear-gradient(135deg, #8b5cf6, #ec4899)",
              }}
            />
          </>
        )}
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Timeline/Repeat",
  component: RepeatStory,
  args: { layout: "pulse", iterations: 6, delay: 300 },
  argTypes: {
    layout: { control: "radio", options: ["pulse", "choreography"] },
    iterations: { control: { type: "range", min: 2, max: 12, step: 1 } },
    delay: { control: { type: "range", min: 0, max: 800, step: 50 } },
  },
} satisfies Meta<typeof RepeatStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `direction: "alternate"` ping-pongs the pulse without snapping to the start (§13.1). */
export const AlternatePulse: Story = {};

/** Repeating a whole sequence: compact single entry, terminal values held across each gap (§14.2, §13.1). */
export const RepeatedChoreography: Story = {
  args: { layout: "choreography", iterations: 3, delay: 300 },
};
