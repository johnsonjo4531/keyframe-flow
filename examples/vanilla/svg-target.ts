import { Animation, target } from "keyframe-flow";
import { codeLine, column, mountTransport, num, type VanillaMount } from "./harness.ts";

/**
 * SVG adapter (§17) — vanilla twin of `Targets/SVG Adapter`: writes the SVG
 * 1.1 `transform="matrix(a, b, c, d, e, f)"` attribute mapped from the
 * matrix's column vectors. SVG is inherently 2D affine — Z and perspective
 * members are not expressible here.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);

  const wrapper = document.createElement("div");
  // Building the SVG as markup keeps the vanilla example short; any DOM API
  // (createElementNS included) works just as well.
  wrapper.innerHTML = `
    <svg width="360" height="140" viewBox="-180 -70 360 140">
      <g>
        <rect x="-28" y="-28" width="56" height="56" rx="10" fill="#f43f5e"></rect>
        <circle cx="20" cy="-20" r="8" fill="#fff" opacity="0.85"></circle>
      </g>
    </svg>`;
  root.appendChild(wrapper);
  const group = wrapper.querySelector("g");
  if (group === null) {
    return () => {
      root.remove();
    };
  }

  const animation = Animation.from({
    from: { position: [-90, 0, 0], scale: 0.6 },
    to: { position: [90, 0, 0], scale: 1.4 },
    duration: num(args, "duration", 1400),
    easing: "ease-in-out",
  });

  const playback = animation.attach(target.svg(group));

  // Show the attribute the adapter actually wrote.
  const code = codeLine(root);
  let raf = 0;
  const poll = (): void => {
    code.textContent = group.getAttribute("transform") ?? "";
    if (playback.state === "running") raf = requestAnimationFrame(poll);
  };

  mountTransport(root, playback);
  root.querySelectorAll("button").forEach((button) =>
    button.addEventListener("click", () => {
      cancelAnimationFrame(raf);
      poll();
    }),
  );

  playback.play();
  poll(); // start after play() — the loop only keeps ticking while running

  return () => {
    cancelAnimationFrame(raf);
    playback.dispose();
    root.remove();
  };
};
