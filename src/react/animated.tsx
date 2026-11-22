import type * as React from "react";

import { useKeyframePlayback } from "./use-keyframe-playback.ts";
import type { Animation } from "../index.ts";
import { target as targetAdapters } from "../index.ts";
import type { UseKeyframePlaybackOptions } from "./use-keyframe-playback.ts";

/** Props for {@link Animated}: an animation, attach options, and div props. */
export interface AnimatedProps extends React.HTMLAttributes<HTMLDivElement> {
  /** The immutable definition to run (§5). Memoize it — new identities re-attach. */
  animation: Animation;
  /**
   * Attach options (iterations, direction, rate, autoplay, engine…). The
   * `makeTarget` field defaults to `target.html(host)`, so the div is driven
   * by CSS `matrix3d()` transforms unless a different target is supplied.
   */
  options?: UseKeyframePlaybackOptions | undefined;
}

// Module-level so the default factory keeps a stable identity across renders
// (a fresh arrow each render would re-attach the playback every render).
const htmlTarget = (host: HTMLElement) => targetAdapters.html(host);

/**
 * Declarative HTML helper: renders a `div` whose transform is driven by an
 * animation through the built-in HTML adapter (§17.1). The playback attaches
 * on mount and disposes on unmount without touching the element itself (B.8);
 * for transport UI or non-HTML targets use {@link useKeyframePlayback}
 * directly with the returned handle.
 *
 * ```tsx
 * <Animated animation={slideIn} options={{ autoplay: true }} className="card" />
 * ```
 */
export function Animated({
  animation,
  options,
  children,
  ...rest
}: AnimatedProps): React.ReactElement {
  const resolved: UseKeyframePlaybackOptions = {
    ...options,
    makeTarget: options?.makeTarget ?? htmlTarget,
  };
  const { ref } = useKeyframePlayback<HTMLDivElement>(animation, resolved);
  return (
    <div ref={ref} {...rest}>
      {children}
    </div>
  );
}
