import type { RenderTarget } from "../targets/types.ts";

/**
 * Internal contract for execution instances that can own a render target.
 * Both `Playback` and `TimelinePlayback` implement it so §14 replacement
 * semantics hold across definition types — starting a timeline playback on a
 * target supersedes an animation playback owning it, and vice versa.
 */
export interface TargetOwner {
  /** Called when another execution instance claims this owner's target (§14). */
  supersedeByReplacement(): void;
}

/** Registry enforcing §14 replacement semantics: one active owner per target. */
const targetOwners = new WeakMap<RenderTarget, TargetOwner>();

/** Claims `target` for `owner`, superseding the current owner if any (§14). */
export function claimTarget(target: RenderTarget, owner: TargetOwner): void {
  const current = targetOwners.get(target);
  if (current !== undefined && current !== owner) {
    current.supersedeByReplacement();
  }
  targetOwners.set(target, owner);
}

/** Releases `target` when — and only when — `owner` currently holds it. */
export function releaseTarget(target: RenderTarget, owner: TargetOwner): void {
  if (targetOwners.get(target) === owner) {
    targetOwners.delete(target);
  }
}
