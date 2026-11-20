import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * WebGL adapter (§3.6): the adapter never creates GPU resources — it hands
 * the host a column-major `Float32Array` through `onTransform`, exactly the
 * layout `gl.uniformMatrix4fv` expects (§15.2). The story owns the GL context
 * and draw loop; disposal of the playback leaves both untouched (Appendix B.8).
 */
function WebGLTargetStory({ duration }: { duration: number }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uModelRef = useRef<WebGLUniformLocation | null>(null);
  const [supported, setSupported] = useState(true);
  const [uploaded, setUploaded] = useState("");
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-0.8, -0.4, 0], scale: 0.5 },
        to: { position: [0.8, 0.4, 0], scale: 1.2, rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    () =>
      target.webgl({
        onTransform: (values) => {
          // The host decides what to do with the matrix — here, a uniform upload.
          setUploaded(
            `m[12]=${(values[12] ?? 0).toFixed(3)} m[13]=${(values[13] ?? 0).toFixed(3)}`,
          );
          glRef.current?.uniformMatrix4fv(uModelRef.current, false, values);
        },
      }),
    [duration],
  );

  // Story-owned GL setup: compile a trivial shader, draw a quad transformed
  // by the uniform the adapter keeps fresh.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const gl = canvas.getContext("webgl");
    if (gl === null) {
      setSupported(false);
      return;
    }
    glRef.current = gl;

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
    if (program === null || vertex === null || fragment === null) return;
    gl.attachShader(program, vertex);
    gl.attachShader(program, fragment);
    gl.linkProgram(program);
    gl.useProgram(program);

    uModelRef.current = gl.getUniformLocation(program, "uModel");
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

    return () => {
      cancelAnimationFrame(raf);
      gl.deleteProgram(program);
      gl.deleteShader(vertex);
      gl.deleteShader(fragment);
      glRef.current = null;
    };
  }, []);

  if (!supported) {
    return <p style={{ color: "#9ca3af" }}>WebGL is unavailable in this browser.</p>;
  }

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <canvas ref={canvasRef} width={420} height={220} style={{ maxWidth: "100%" }} />
      <code style={{ fontSize: 11, color: "#9ca3af" }}>uniform upload — {uploaded}</code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/WebGL Adapter",
  component: WebGLTargetStory,
  args: { duration: 1600 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof WebGLTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Column-major `Float32Array` handed straight to `uniformMatrix4fv`. */
export const UniformUpload: Story = {};
