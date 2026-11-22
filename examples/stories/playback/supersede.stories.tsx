import { Animation, target } from "keyframe-flow";
import type { Playback, PlaybackResult, RenderTarget } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Target ownership & supersede (§14): a render target is owned by at most one
 * active playback. When a second playback starts on the same target, the
 * previous run is cancelled — its `finished` resolves `{ status: "cancelled" }`
 * (never rejects) and stops writing to the element. No additive composition,
 * no timers left running.
 */
function SupersedeStory({ duration }: { duration: number }): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const [statusA, setStatusA] = useState<PlaybackResult | undefined>(undefined);
  const [statusB, setStatusB] = useState<PlaybackResult | undefined>(undefined);
  const playbacksRef = useRef<{ a?: Playback; b?: Playback }>({});

  // One shared render target object — ownership is per target (§14).
  const makeTarget = useMemo(() => {
    let cached: RenderTarget | undefined;
    return (host: HTMLElement): RenderTarget => {
      cached ??= target.html(host);
      return cached;
    };
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    const renderTarget = makeTarget(host);

    const a = Animation.from({
      to: { position: [-140, 0, 0], scale: 2 },
      duration,
      easing: "linear",
    }).attach(renderTarget);
    const b = Animation.from({
      to: { position: [140, 0, 0], rotation: [0, 0, Math.PI / 2] },
      duration,
      easing: "linear",
    }).attach(renderTarget);

    playbacksRef.current = { a, b };
    void a.finished.then(setStatusA);
    void b.finished.then(setStatusB);

    return () => {
      a.dispose();
      b.dispose();
      playbacksRef.current = {};
    };
  }, [duration, makeTarget]);

  const button = { padding: "4px 10px", cursor: "pointer" } as const;

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 140, position: "relative" }}>
        <div
          ref={hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 64,
            height: 64,
            marginLeft: -32,
            marginTop: -32,
            borderRadius: 12,
            background: "linear-gradient(135deg, #64748b, #0f172a)",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 8 }}>
        <button type="button" style={button} onClick={() => playbacksRef.current.a?.play()}>
          ▶ A (grow left)
        </button>
        <button type="button" style={button} onClick={() => playbacksRef.current.b?.play()}>
          ▶ B (spin right — supersedes A)
        </button>
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          marginTop: 12,
          display: "flex",
          gap: 16,
        }}
      >
        <span>A finished: {statusA?.status ?? "pending"}</span>
        <span>B finished: {statusB?.status ?? "pending"}</span>
      </div>
    </div>
  );
}

const meta = {
  title: "Playback/Target Supersede",
  component: SupersedeStory,
  args: {
    duration: 2000,
  },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 6000, step: 100 } },
  },
} satisfies Meta<typeof SupersedeStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * Target ownership from the
 * [Playback & lifecycle guide](https://johnsonjo4531.github.io/keyframe-flow/docs/playback-lifecycle/):
 * press ▶ B while A is running and ownership transfers — A's `finished`
 * resolves `{ status: "cancelled" }`, A stops writing, and only B keeps
 * driving the element. Replacement, not composition (§14).
 */
export const OwnershipTransfer: Story = {};
