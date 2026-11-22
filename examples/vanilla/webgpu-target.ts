import { Animation, target } from "keyframe-flow";
import { column, mountTransport, num, type VanillaMount } from "./harness.ts";

/**
 * WebGPU adapter (§3.6) — vanilla twin of `Targets/WebGPU Adapter`: like the
 * WebGL adapter it creates no GPU resources — each evaluated frame hands the
 * host a column-major `Float32Array` through `onTransform`, ready for
 * `queue.writeBuffer`. This example stays device-free (no `navigator.gpu`
 * needed): the upload path is just an array callback, so the panel shows
 * exactly what would be written into the uniform buffer.
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);

  const panel = document.createElement("div");
  panel.style.width = "320px";
  panel.style.height = "160px";
  panel.style.display = "grid";
  panel.style.placeItems = "center";
  panel.style.border = "1px dashed #6b728055";
  panel.style.borderRadius = "12px";
  const label = document.createElement("span");
  label.style.fontSize = "13px";
  label.style.color = "#9ca3af";
  panel.appendChild(label);
  root.appendChild(panel);

  const animation = Animation.from({
    from: { position: [-100, -30, 0], scale: 0.6 },
    to: { position: [100, 30, 0], rotation: [0, Math.PI / 4, 0] },
    duration: num(args, "duration", 1600),
    easing: "ease-in-out",
  });

  const playback = animation.attach(
    target.webgpu({
      onTransform: (values) => {
        // In a real renderer: device.queue.writeBuffer(uniforms, 0, values).
        label.textContent = `uniform buffer translation: [${Array.from(values.slice(12, 15), (v) => v.toFixed(1)).join(", ")}]`;
      },
    }),
  );

  mountTransport(root, playback);
  playback.play();

  return () => {
    playback.dispose();
    root.remove();
  };
};
