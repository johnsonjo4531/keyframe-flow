import { Animation, target } from "keyframe-flow";
import type { Playback, PlaybackState } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Transport, type PlaybackHandleLike } from "../playback-story";

const COLUMNS = 20;
const CELL = 28;
const DOT = 16;

/**
 * Imperative stress field: the stage holds one absolutely-positioned dot per
 * animated element, each driven by its own playback of a **shared** animation
 * definition. Elements are added at runtime without touching the playbacks
 * already running — `attach` creates an independent instance per target (§11)
 * and the centralized scheduler folds them all into one frame loop (§16).
 */
interface StressField {
  readonly playbacks: readonly Playback[];
  add(count: number): void;
  clear(): void;
}

function createStressField(stageEl: HTMLElement, duration: number): StressField {
  const pulse = Animation.from({
    from: { position: [0, 14, 0], scale: 0.5 },
    to: { position: [0, -20, 0], scale: 1.2 },
    duration,
    easing: "ease-in-out",
  });

  const playbacks: Playback[] = [];

  const add = (count: number): void => {
    for (let k = 0; k < count; k++) {
      const i = playbacks.length;
      const dot = document.createElement("div");
      dot.style.cssText = `position:absolute;left:${(i % COLUMNS) * CELL + (CELL - DOT) / 2}px;top:${Math.floor(i / COLUMNS) * CELL}px;width:${DOT}px;height:${DOT}px;border-radius:9999px;background:hsl(${(i * 47) % 360} 85% 55%)`;
      stageEl.appendChild(dot);

      const playback = pulse.attach(target.html(dot), {
        iterations: "infinite",
        direction: "alternate",
      });
      // Deterministic phase offsets from the shared timeline (§12) — the wave
      // pattern needs no per-element timers or delays.
      playback.seek((i * 97) % duration);
      playback.play();
      playbacks.push(playback);
    }
    stageEl.style.height = `${Math.max(180, Math.ceil(playbacks.length / COLUMNS) * CELL + 24)}px`;
  };

  const clear = (): void => {
    // Disposing every playback unregisters it from the shared scheduler — no
    // leaked scheduled units when elements leave the field (§12).
    for (const playback of playbacks) playback.dispose();
    playbacks.length = 0;
    stageEl.replaceChildren();
    stageEl.style.height = "180px";
  };

  return { playbacks, add, clear };
}

/** Aggregate view across every playback: running if any runs, else paused. */
function aggregateState(playbacks: readonly Playback[]): PlaybackState {
  let sawPaused = false;
  for (const playback of playbacks) {
    if (playback.state === "running") return "running";
    if (playback.state === "paused") sawPaused = true;
  }
  const first = playbacks[0];
  return sawPaused ? "paused" : first !== undefined ? first.state : "idle";
}

interface StressStats {
  readonly elements: number;
  readonly running: number;
  readonly state: PlaybackState;
  readonly fps: number;
  readonly frameMs: number;
}

const EMPTY_STATS: StressStats = { elements: 0, running: 0, state: "idle", fps: 0, frameMs: 0 };

function countRunning(playbacks: readonly Playback[]): number {
  return playbacks.reduce((n, playback) => (playback.state === "running" ? n + 1 : n), 0);
}

/**
 * Performance stress test (§16), as referenced from the [Playback & lifecycle
 * guide](https://johnsonjo4531.github.io/keyframe-flow/docs/playback-lifecycle/):
 * one shared `Animation` definition fans out to **hundreds of independent
 * playbacks**, all driven by the library's single centralized scheduler — one
 * `requestAnimationFrame` subscription regardless of element count. Use the
 * buttons (or the `count` arg) to pile on animated elements live: each new
 * element attaches its own playback onto the running engine without disturbing
 * the ones already in flight, and the readout shows measured FPS and average
 * frame time so you can watch where scaling starts to cost. The transport
 * buttons fan out to every playback through one structurally-typed handle —
 * pausing all of them shows the idle overhead is zero, since the scheduler
 * stops requesting frames when nothing is active (§16).
 */
function StressTestStory({
  count,
  duration,
}: {
  count: number;
  duration: number;
}): React.ReactElement {
  const stageRef = useRef<HTMLDivElement | null>(null);
  const fieldRef = useRef<StressField | null>(null);
  const [customCount, setCustomCount] = useState(500);
  const [stats, setStats] = useState<StressStats>(EMPTY_STATS);

  // Reflect element/running counts synchronously on every mutation — rAF can
  // stall in occluded or nested-iframe contexts, and a live count shouldn't
  // wait for the next measurement sample to show up.
  const syncCounts = useCallback((): void => {
    const field = fieldRef.current;
    if (field === null) return;
    setStats((prev) => ({
      ...prev,
      elements: field.playbacks.length,
      running: countRunning(field.playbacks),
      state: aggregateState(field.playbacks),
    }));
  }, []);

  useEffect(() => {
    const stageEl = stageRef.current;
    if (stageEl === null) return undefined;

    const field = createStressField(stageEl, duration);
    field.add(count);
    fieldRef.current = field;
    syncCounts();

    // Measurement loop: samples the *actual* frame cadence. The engine's
    // scheduler is a separate rAF subscriber (§16); this one only measures.
    let raf = 0;
    let frames = 0;
    let elapsed = 0;
    let sumDelta = 0;
    let last = performance.now();
    const tick = (now: number): void => {
      const delta = now - last;
      last = now;
      frames += 1;
      elapsed += delta;
      sumDelta += delta;
      if (elapsed >= 500) {
        setStats({
          elements: field.playbacks.length,
          running: countRunning(field.playbacks),
          state: aggregateState(field.playbacks),
          fps: (frames * 1000) / elapsed,
          frameMs: sumDelta / frames,
        });
        frames = 0;
        elapsed = 0;
        sumDelta = 0;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      field.clear(); // dispose every playback on unmount — nothing keeps running
      fieldRef.current = null;
    };
  }, [count, duration, syncCounts]);

  // One fan-out handle drives all playbacks through the shared transport
  // chrome — any object with this shape can drive it (playback-story.tsx).
  const handle = useMemo<PlaybackHandleLike>(
    () => ({
      get state() {
        return fieldRef.current !== null ? aggregateState(fieldRef.current.playbacks) : "idle";
      },
      get currentTime() {
        return fieldRef.current?.playbacks[0]?.currentTime ?? 0;
      },
      get iterationCount() {
        return fieldRef.current?.playbacks[0]?.iterationCount ?? 0;
      },
      result: undefined, // infinite playbacks never finish (§13)
      play() {
        for (const playback of fieldRef.current?.playbacks ?? []) playback.play();
        syncCounts();
      },
      pause() {
        for (const playback of fieldRef.current?.playbacks ?? []) playback.pause();
        syncCounts();
      },
      reset() {
        for (const playback of fieldRef.current?.playbacks ?? []) {
          if (playback.reversed) playback.reverse(); // §12: restarts use current direction
          playback.seek(0);
        }
        syncCounts();
      },
      reverse() {
        for (const playback of fieldRef.current?.playbacks ?? []) playback.reverse();
        syncCounts();
      },
      cancel() {
        for (const playback of fieldRef.current?.playbacks ?? []) playback.cancel();
        syncCounts();
      },
    }),
    [syncCounts],
  );

  const button = { padding: "4px 10px", cursor: "pointer" } as const;

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div
        ref={stageRef}
        style={{
          width: COLUMNS * CELL,
          height: 180,
          position: "relative",
          outline: "1px dashed #6b728055",
          borderRadius: 8,
        }}
      />
      <Transport handle={handle} />
      <div style={{ display: "flex", gap: 8, marginTop: 8, alignItems: "center" }}>
        {[10, 100].map((n) => (
          <button
            key={n}
            type="button"
            style={button}
            onClick={() => {
              fieldRef.current?.add(n);
              syncCounts();
            }}
          >
            +{n}
          </button>
        ))}
        <input
          type="number"
          min={1}
          max={5000}
          value={customCount}
          onChange={(event) => setCustomCount(Number(event.target.value))}
          style={{ width: 72, padding: "3px 6px" }}
          aria-label="Number of elements to add"
        />
        <button
          type="button"
          style={button}
          onClick={() => {
            fieldRef.current?.add(Math.max(1, Math.floor(customCount)));
            syncCounts();
          }}
        >
          add
        </button>
        <button
          type="button"
          style={button}
          onClick={() => {
            fieldRef.current?.clear();
            syncCounts();
          }}
        >
          clear all
        </button>
      </div>
      <div
        style={{
          fontFamily: "ui-monospace, monospace",
          fontSize: 12,
          marginTop: 12,
          display: "flex",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <span>
          elements: <b>{stats.elements}</b>
        </span>
        <span>running: {stats.running}</span>
        <span>
          state: <b>{stats.state}</b>
        </span>
        <span>fps: {stats.fps.toFixed(1)}</span>
        <span>frame: {stats.frameMs.toFixed(2)} ms</span>
      </div>
    </div>
  );
}

const meta = {
  title: "Performance/Stress Test",
  component: StressTestStory,
  args: { count: 150, duration: 900 },
  argTypes: {
    count: { control: { type: "range", min: 10, max: 2000, step: 10 } },
    duration: { control: { type: "range", min: 300, max: 4000, step: 100 } },
  },
} satisfies Meta<typeof StressTestStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Hundreds of playbacks, one shared definition, one frame loop — add elements live and watch the FPS (§16). */
export const HeavyField: Story = {};
