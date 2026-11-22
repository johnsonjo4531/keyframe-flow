import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,t as a}from"./src-B0K7CDl1.js";import{n as o,r as s,t as c}from"./playback-story-Dz0vCChe.js";import{r as l,t as u}from"./react-C8WRvr0x.js";function d({duration:e}){let t=(0,f.useRef)(null),n=(0,f.useRef)(null),a=(0,f.useRef)(null),[s,u]=(0,f.useState)(!0),[d,m]=(0,f.useState)(``),h=(0,f.useMemo)(()=>r.from({from:{position:[-.8,-.4,0],scale:.5},to:{position:[.8,.4,0],scale:1.2,rotation:[0,0,Math.PI/3]},duration:e,easing:`ease-in-out`}),[e]),g=(0,f.useCallback)(()=>i.webgl({onTransform:e=>{m(`m[12]=${(e[12]??0).toFixed(3)} m[13]=${(e[13]??0).toFixed(3)}`),n.current?.uniformMatrix4fv(a.current,!1,e)}}),[]),_=l(h,{autoplay:!0,makeTarget:g});return(0,f.useEffect)(()=>{let e=t.current;if(e===null)return;let r=e.getContext(`webgl`);if(r===null){u(!1);return}n.current=r;let i=(e,t)=>{let n=r.createShader(e);return n===null?null:(r.shaderSource(n,t),r.compileShader(n),n)},o=r.createProgram(),s=i(r.VERTEX_SHADER,`attribute vec2 aPos; uniform mat4 uModel; void main() { gl_Position = uModel * vec4(aPos, 0.0, 1.0); }`),c=i(r.FRAGMENT_SHADER,`precision mediump float; void main() { gl_FragColor = vec4(0.95, 0.35, 0.55, 1.0); }`);if(o===null||s===null||c===null)return;r.attachShader(o,s),r.attachShader(o,c),r.linkProgram(o),r.useProgram(o),a.current=r.getUniformLocation(o,`uModel`);let l=r.createBuffer();r.bindBuffer(r.ARRAY_BUFFER,l),r.bufferData(r.ARRAY_BUFFER,new Float32Array([-.15,-.15,.15,-.15,.15,.15,-.15,.15]),r.STATIC_DRAW);let d=r.getAttribLocation(o,`aPos`);r.enableVertexAttribArray(d),r.vertexAttribPointer(d,2,r.FLOAT,!1,0,0);let f=0,p=()=>{r.clearColor(.06,.07,.09,1),r.clear(r.COLOR_BUFFER_BIT),r.drawArrays(r.TRIANGLE_FAN,0,4),f=requestAnimationFrame(p)};return f=requestAnimationFrame(p),()=>{cancelAnimationFrame(f),r.deleteProgram(o),r.deleteShader(s),r.deleteShader(c),n.current=null}},[]),s?(0,p.jsxs)(`div`,{ref:_.ref,style:{display:`grid`,justifyItems:`center`},children:[(0,p.jsx)(`canvas`,{ref:t,width:420,height:220,style:{maxWidth:`100%`}}),(0,p.jsxs)(`code`,{style:{fontSize:11,color:`#9ca3af`},children:[`uniform upload — `,d]}),(0,p.jsx)(o,{handle:_}),(0,p.jsx)(c,{handle:_})]}):(0,p.jsx)(`p`,{style:{color:`#9ca3af`},children:`WebGL is unavailable in this browser.`})}var f,p,m,h,g;function _(){return(_=e((()=>{a(),f=n(),s(),u(),p=t(),m={title:`Targets/WebGL Adapter`,component:d,args:{duration:1600},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}}}},h={},typeof m==`object`&&m&&(m.parameters=Object.assign({},m.parameters,{docs:Object.assign({},m.parameters&&m.parameters.docs,{source:Object.assign({},m.parameters&&m.parameters.docs&&m.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * WebGL adapter (§3.6): the adapter never creates GPU resources — it hands
 * the host a column-major \`Float32Array\` through \`onTransform\`, exactly the
 * layout \`gl.uniformMatrix4fv\` expects (§15.2). The story owns the GL context
 * and draw loop; disposal of the playback leaves both untouched (Appendix B.8).
 */
function WebGLTargetStory({ duration }: { duration: number }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uModelRef = useRef<WebGLUniformLocation | null>(null);
  const [supported, setSupported] = useState(true);
  const [uploaded, setUploaded] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-0.8, -0.4, 0], scale: 0.5 },
        to: { position: [0.8, 0.4, 0], scale: 1.2, rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback(
    () =>
      target.webgl({
        onTransform: (values) => {
          // The host decides what to do with the matrix — here, a uniform upload.
          setUploaded(
            \`m[12]=\${(values[12] ?? 0).toFixed(3)} m[13]=\${(values[13] ?? 0).toFixed(3)}\`,
          );
          glRef.current?.uniformMatrix4fv(uModelRef.current, false, values);
        },
      }),
    [],
  );
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

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

    const vs = \`attribute vec2 aPos; uniform mat4 uModel; void main() { gl_Position = uModel * vec4(aPos, 0.0, 1.0); }\`;
    const fs = \`precision mediump float; void main() { gl_FragColor = vec4(0.95, 0.35, 0.55, 1.0); }\`;
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
    // hostRef is required by useKeyframePlayback (it builds the playback from
    // a mounted host) but layout-only here — the WebGL target ignores it.
    <div ref={handle.ref} style={{ display: "grid", justifyItems: "center" }}>
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
  args: {
    duration: 1600,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof WebGLTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The WebGL section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * the adapter creates no GL resources — each frame it hands the host a
 * column-major \`Float32Array\` through \`onTransform\`, exactly what
 * \`gl.uniformMatrix4fv\` wants. The story owns the context and draw loop; the
 * spinning cube is drawn by that loop with the uploaded uniform.
 */
export const UniformUpload: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * WebGL adapter (§3.6): the adapter never creates GPU resources — it hands
 * the host a column-major \`Float32Array\` through \`onTransform\`, exactly the
 * layout \`gl.uniformMatrix4fv\` expects (§15.2). The story owns the GL context
 * and draw loop; disposal of the playback leaves both untouched (Appendix B.8).
 */
function WebGLTargetStory({ duration }: { duration: number }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const glRef = useRef<WebGLRenderingContext | null>(null);
  const uModelRef = useRef<WebGLUniformLocation | null>(null);
  const [supported, setSupported] = useState(true);
  const [uploaded, setUploaded] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-0.8, -0.4, 0], scale: 0.5 },
        to: { position: [0.8, 0.4, 0], scale: 1.2, rotation: [0, 0, Math.PI / 3] },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback(
    () =>
      target.webgl({
        onTransform: (values) => {
          // The host decides what to do with the matrix — here, a uniform upload.
          setUploaded(
            \`m[12]=\${(values[12] ?? 0).toFixed(3)} m[13]=\${(values[13] ?? 0).toFixed(3)}\`,
          );
          glRef.current?.uniformMatrix4fv(uModelRef.current, false, values);
        },
      }),
    [],
  );
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

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

    const vs = \`attribute vec2 aPos; uniform mat4 uModel; void main() { gl_Position = uModel * vec4(aPos, 0.0, 1.0); }\`;
    const fs = \`precision mediump float; void main() { gl_FragColor = vec4(0.95, 0.35, 0.55, 1.0); }\`;
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
    // hostRef is required by useKeyframePlayback (it builds the playback from
    // a mounted host) but layout-only here — the WebGL target ignores it.
    <div ref={handle.ref} style={{ display: "grid", justifyItems: "center" }}>
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
  args: {
    duration: 1600,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof WebGLTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The WebGL section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * the adapter creates no GL resources — each frame it hands the host a
 * column-major \`Float32Array\` through \`onTransform\`, exactly what
 * \`gl.uniformMatrix4fv\` wants. The story owns the context and draw loop; the
 * spinning cube is drawn by that loop with the uploaded uniform.
 */
export const UniformUpload: Story = {};
`})})})),g=[`UniformUpload`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source},description:{story:"The WebGL section of the\n[Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):\nthe adapter creates no GL resources — each frame it hands the host a\ncolumn-major `Float32Array` through `onTransform`, exactly what\n`gl.uniformMatrix4fv` wants. The story owns the context and draw loop; the\nspinning cube is drawn by that loop with the uploaded uniform.",...h.parameters?.docs?.description}}}})))()}_();export{h as UniformUpload,g as __namedExportsOrder,m as default};