import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useEffect, useMemo, useRef } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * The three-object model from the
 * [Getting Started guide](https://johnsonjo4531.github.io/keyframe-flow/docs/getting-started/)
 * — the `slide` snippet running verbatim. A definition (what moves: identity
 * → +100 x, +50 y over 800 ms with `ease-out-cubic`), a playback created by
 * `slide.attach(target.html(box))` (when and how it plays), and the HTML
 * render target (where it appears). Press play to run it exactly as the guide
 * does — `finished` resolves with `{ status: "finished" }`, never rejects.
 */
function FirstAnimationStory(): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: transform(), // identity: position (0,0,0), no rotation, scale 1
        to: transform().translate(100, 50), // move +100 x, +50 y
        duration: 800, // milliseconds
        easing: "ease-out-cubic",
      }),
    [],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 180, position: "relative" }}>
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
            background: "linear-gradient(135deg, #f97316, #db2777)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Guides/Getting Started",
  component: FirstAnimationStory,
} satisfies Meta<typeof FirstAnimationStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's `slide` definition attached to an HTML element. */
export const FirstAnimation: Story = {};

/**
 * Manual sampling from the same guide section: the identical `slide`
 * definition evaluated at any time with no scheduler, no playback instance,
 * and no render target (§10). The host loop below is a plain
 * `requestAnimationFrame` that calls `slide.sample(t)` itself and writes the
 * result — definitions are pure functions of time, so this is first-class.
 */
function SampleWithoutPlayingStory(): React.ReactElement {
  const slide = useMemo(
    () =>
      Animation.from({
        from: transform(), // the same definition as FirstAnimation
        to: transform().translate(100, 50),
        duration: 800,
        easing: "ease-out-cubic",
      }),
    [],
  );

  const boxRef = useRef<HTMLDivElement | null>(null);
  const readoutRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const frame = (now: number): void => {
      // Ping-pong across [0, duration] so the sampled value sweeps both ways.
      const phase = (now - start) % (slide.duration * 2);
      const t = phase < slide.duration ? phase : slide.duration * 2 - phase;

      const transformAtT = slide.sample(t); // Transform at t ms — pure call
      const matrix = transformAtT.toMatrix(); // Matrix4 for your own upload path
      if (boxRef.current !== null) {
        boxRef.current.style.transform = `matrix3d(${matrix.toArray().join(",")})`;
      }
      if (readoutRef.current !== null) {
        const p = transformAtT.components.position.toArray();
        readoutRef.current.textContent =
          `slide.sample(${t.toFixed(0)}) → position [${p[0].toFixed(1)}, ${p[1].toFixed(1)}] · ` +
          `sampleProgress(${(t / slide.duration).toFixed(2)}) is identical`;
      }
      raf = requestAnimationFrame(frame);
    };
    raf = requestAnimationFrame(frame);
    return () => cancelAnimationFrame(raf);
  }, [slide]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 180, position: "relative" }}>
        <div
          ref={boxRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #0ea5e9, #22c55e)",
          }}
        />
      </div>
      <code style={{ fontSize: 11.5, marginTop: 8 }}>
        <span ref={readoutRef} />
      </code>
    </div>
  );
}

/** The guide's manual sampling: an external rAF loop drives `slide.sample`. */
export const SampleWithoutPlaying = {
  render: SampleWithoutPlayingStory,
} satisfies Story;
