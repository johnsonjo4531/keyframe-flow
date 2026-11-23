import { Animation, Timeline, target } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useRef } from "react";
import { Readout, Transport } from "../playback-story";
import { requireHost, useTimelinePlayback } from "../timeline-story";

const CARDS = 5;

/**
 * Stagger (§14.1), as demonstrated in the [Timeline guide](https://johnsonjo4531.github.io/keyframe-flow/docs/timeline-choreography/):
 * `Timeline.stagger(child, targets, { delay })` is **not** a special runtime
 * node — it compiles to ordinary scheduled entries at `i × delay`, each bound
 * to its own render target. `order: "reverse"` flips which index starts first
 * without touching the child definition. The duration follows the last entry:
 * `(count − 1) × delay + childDuration`. Here five cards fan in from the left,
 * each starting one interval after the previous.
 */
function StaggerStory({
  delay,
  order,
}: {
  delay: number;
  order: "forward" | "reverse";
}): React.ReactElement {
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);

  const makeTimeline = useCallback(
    () =>
      Timeline.stagger(
        Animation.from({
          from: { position: [-260, 0, 0], rotation: [0, 0, -Math.PI / 8] },
          to: { position: [0, 0, 0] },
          duration: 450,
          easing: "ease-out",
        }),
        Array.from({ length: CARDS }, (_, i) =>
          target.html(requireHost({ current: cardRefs.current[i] ?? null })),
        ),
        { delay, order },
      ),
    [delay, order],
  );
  const handle = useTimelinePlayback(makeTimeline, { autoplay: true });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 170, position: "relative" }}>
        {Array.from({ length: CARDS }, (_, i) => (
          <div
            key={i}
            ref={(el) => {
              cardRefs.current[i] = el;
            }}
            style={{
              position: "absolute",
              left: 24 + i * 60,
              top: "calc(50% - 34px)",
              width: 48,
              height: 68,
              borderRadius: 8,
              background: `linear-gradient(160deg, hsl(${215 + i * 28} 70% 45%), hsl(${215 + i * 28} 70% 28%))`,
              boxShadow: "0 6px 18px #0006",
            }}
          />
        ))}
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Timeline/Stagger",
  component: StaggerStory,
  args: { delay: 100, order: "forward" },
  argTypes: {
    delay: { control: { type: "range", min: 40, max: 320, step: 20 } },
    order: { control: "radio", options: ["forward", "reverse"] },
  },
} satisfies Meta<typeof StaggerStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** `Timeline.stagger` expands to ordinary entries at `i × delay`, one per target (§14.1). */
export const CardFan: Story = {};
