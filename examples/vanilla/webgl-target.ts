import { Animation, target } from "keyframe-flow";
import { codeLine, column, mountTransport, num, type VanillaMount } from "./harness.ts";

/**
 * WebGL adapter (§3.6) — vanilla twin of `Targets/WebGL Adapter`: the
 * adapter never creates GPU resources — it hands the host a column-major
 * `Float32Array` through `onTransform`, exactly the layout
 * `gl.uniformMatrix4fv` expects (§15.2). The example owns the GL context and
 * draw loop; disposing the playback leaves both untouched (Appendix B.8).
 */
export const mount: VanillaMount = (host, args) => {
  const root = column(host);

  const canvas = document.createElement("canvas");
  canvas.width = 420;
  canvas.height = 220;
  canvas.style.maxWidth = "100%";
  root.appendChild(canvas);
  const gl = canvas.getContext("webgl");
  if (gl === null) {
    const note = document.createElement("p");
    note.style.color = "#9ca3af";
    note.textContent = "WebGL is unavailable in this browser.";
    root.appendChild(note);
    return () => {
      root.remove();
    };
  }

  // Example-owned GL setup: compile a trivial shader, draw a quad
  // transformed by the uniform the adapter keeps fresh.
  const vs = `attribute vec2 aPos; uniform mat4 uModel; void main() { gl_Position = uModel * vec4(aPos, 0.0, 1.0); }`;
  const fs = `precision mediump float; void main() { gl_FragColor = vec4(0.95, 0.35, 0.55, 1.0); }`;
  const compile = (type: number, src: string): WebGLShader | null => {
    const shader = gl.createShader(type);
    if (shader === null) return null;
    gl.shaderSource(shader, src);
    gl.compileShader(shader);
    return shader;
  };
  const program = gl.createProgram();
  const vertex = compile(gl.VERTEX_SHADER, vs);
  const fragment = compile(gl.FRAGMENT_SHADER, fs);
  if (program === null || vertex === null || fragment === null) {
    return () => {
      root.remove();
    };
  }
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.useProgram(program);

  const uModel = gl.getUniformLocation(program, "uModel");
  const buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(
    gl.ARRAY_BUFFER,
    new Float32Array([-0.15, -0.15, 0.15, -0.15, 0.15, 0.15, -0.15, 0.15]),
    gl.STATIC_DRAW,
  );
  const aPos = gl.getAttribLocation(program, "aPos");
  gl.enableVertexAttribArray(aPos);
  gl.vertexAttribPointer(aPos, 2, gl.FLOAT, false, 0, 0);

  let raf = 0;
  const draw = (): void => {
    gl.clearColor(0.06, 0.07, 0.09, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
    gl.drawArrays(gl.TRIANGLE_FAN, 0, 4);
    raf = requestAnimationFrame(draw);
  };
  raf = requestAnimationFrame(draw);

  const code = codeLine(root);
  const animation = Animation.from({
    from: { position: [-0.8, -0.4, 0], scale: 0.5 },
    to: { position: [0.8, 0.4, 0], scale: 1.2, rotation: [0, 0, Math.PI / 3] },
    duration: num(args, "duration", 1600),
    easing: "ease-in-out",
  });

  const playback = animation.attach(
    target.webgl({
      onTransform: (values) => {
        // The host decides what to do with the matrix — here, a uniform upload.
        code.textContent = `uniform upload — m[12]=${(values[12] ?? 0).toFixed(3)} m[13]=${(values[13] ?? 0).toFixed(3)}`;
        gl.uniformMatrix4fv(uModel, false, values);
      },
    }),
  );

  mountTransport(root, playback);
  playback.play();

  return () => {
    cancelAnimationFrame(raf);
    playback.dispose(); // leaves the GL context and program untouched (B.8)
    gl.deleteProgram(program);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    root.remove();
  };
};
