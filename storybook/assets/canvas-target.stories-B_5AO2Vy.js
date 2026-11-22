import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,t as a}from"./src-B0K7CDl1.js";import{n as o,r as s,t as c}from"./playback-story-Dz0vCChe.js";import{r as l,t as u}from"./react-C8WRvr0x.js";function d({duration:e,perspective:t}){let n=(0,f.useRef)(null),[a,s]=(0,f.useState)(``),u=(0,f.useMemo)(()=>r.from({from:{position:[-120,0,-40],rotation:[0,0,0]},to:{position:[120,0,80],rotation:[0,0,Math.PI/5]},duration:e,easing:`linear`}),[e,t]),d=(0,f.useCallback)(e=>{let n=e.querySelector(`canvas`)?.getContext(`2d`);if(n==null)throw Error(`Canvas 2D unavailable in story host.`);return i.canvas(n,t>0?{perspective:t}:void 0)},[t]),m=l(u,{autoplay:!0,makeTarget:d});return(0,f.useEffect)(()=>{let e=n.current;if(e===null)return;let t=e.getContext(`2d`);if(t===null)return;let r=0,i=()=>{t.save(),t.setTransform(1,0,0,1,0,0),t.clearRect(0,0,e.width,e.height),t.restore();let n=t.getTransform();s(`e=${n.e.toFixed(1)} f=${n.f.toFixed(1)}`),t.fillStyle=`#84cc16`,t.fillRect(-30,-30,60,60),r=requestAnimationFrame(i)};return r=requestAnimationFrame(i),()=>cancelAnimationFrame(r)},[]),(0,f.useEffect)(()=>{t<=0&&s(``)},[t]),(0,p.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,p.jsx)(`div`,{ref:m.ref,children:(0,p.jsx)(`canvas`,{ref:n,width:420,height:180})}),a!==``&&(0,p.jsxs)(`code`,{style:{fontSize:11,color:`#9ca3af`},children:[`CTM: `,a]}),(0,p.jsx)(o,{handle:m}),(0,p.jsx)(c,{handle:m})]})}var f,p,m,h,g;function _(){return(_=e((()=>{a(),f=n(),s(),u(),p=t(),m={title:`Targets/Canvas 2D Adapter`,component:d,args:{duration:1800,perspective:400},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}},perspective:{control:{type:`range`,min:0,max:1200,step:50}}}},h={},typeof m==`object`&&m&&(m.parameters=Object.assign({},m.parameters,{docs:Object.assign({},m.parameters&&m.parameters.docs,{source:Object.assign({},m.parameters&&m.parameters.docs&&m.parameters.docs.source,{code:`import { Animation, projectToCanvas2D, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Canvas 2D adapter (§17.3): the evaluated 4×4 matrix goes through an
 * explicit projection step — never forwarded raw — and the fitted affine is
 * installed with \`setTransform\`, replacing the context CTM deterministically.
 */
function CanvasTargetStory({
  duration,
  perspective,
}: {
  duration: number;
  perspective: number;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [projected, setProjected] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-120, 0, -40], rotation: [0, 0, 0] },
        to: { position: [120, 0, 80], rotation: [0, 0, Math.PI / 5] },
        duration,
        easing: "linear",
      }),
    [duration, perspective],
  );
  const makeTarget = useCallback(
    (host: HTMLElement) => {
      const canvas = host.querySelector("canvas");
      const ctx = canvas?.getContext("2d");
      if (ctx === undefined || ctx === null)
        throw new Error("Canvas 2D unavailable in story host.");
      return target.canvas(ctx, perspective > 0 ? { perspective } : undefined);
    },
    [perspective],
  );
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  // The adapter owns the CTM; this loop just draws with it every frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    let raf = 0;
    const draw = (): void => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Draw under the CTM the adapter installed via setTransform.
      const m = ctx.getTransform();
      setProjected(\`e=\${m.e.toFixed(1)} f=\${m.f.toFixed(1)}\`);
      ctx.fillStyle = "#84cc16";
      ctx.fillRect(-30, -30, 60, 60);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Show what the pure projection function produces for the current option.
  useEffect(() => {
    if (perspective <= 0) setProjected("");
  }, [perspective]);

  void projectToCanvas2D; // referenced in docs: the step above is this function, applied per frame

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div ref={handle.ref}>
        <canvas ref={canvasRef} width={420} height={180} />
      </div>
      {projected !== "" && <code style={{ fontSize: 11, color: "#9ca3af" }}>CTM: {projected}</code>}
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/Canvas 2D Adapter",
  component: CanvasTargetStory,
  args: {
    duration: 1800,
    perspective: 400,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    perspective: { control: { type: "range", min: 0, max: 1200, step: 50 } },
  },
} satisfies Meta<typeof CanvasTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The Canvas 2D section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * a 4×4 matrix cannot land on a 2D context raw, so the adapter projects it
 * through a perspective divide and installs the fitted affine with
 * \`setTransform\` — replacing the CTM deterministically each frame (§17.3).
 * Z motion becomes visible scale/offset in the drawing.
 */
export const ProjectedMotion: Story = {};
`,originalSource:`import { Animation, projectToCanvas2D, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Canvas 2D adapter (§17.3): the evaluated 4×4 matrix goes through an
 * explicit projection step — never forwarded raw — and the fitted affine is
 * installed with \`setTransform\`, replacing the context CTM deterministically.
 */
function CanvasTargetStory({
  duration,
  perspective,
}: {
  duration: number;
  perspective: number;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [projected, setProjected] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-120, 0, -40], rotation: [0, 0, 0] },
        to: { position: [120, 0, 80], rotation: [0, 0, Math.PI / 5] },
        duration,
        easing: "linear",
      }),
    [duration, perspective],
  );
  const makeTarget = useCallback(
    (host: HTMLElement) => {
      const canvas = host.querySelector("canvas");
      const ctx = canvas?.getContext("2d");
      if (ctx === undefined || ctx === null)
        throw new Error("Canvas 2D unavailable in story host.");
      return target.canvas(ctx, perspective > 0 ? { perspective } : undefined);
    },
    [perspective],
  );
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  // The adapter owns the CTM; this loop just draws with it every frame.
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    let raf = 0;
    const draw = (): void => {
      ctx.save();
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.restore();

      // Draw under the CTM the adapter installed via setTransform.
      const m = ctx.getTransform();
      setProjected(\`e=\${m.e.toFixed(1)} f=\${m.f.toFixed(1)}\`);
      ctx.fillStyle = "#84cc16";
      ctx.fillRect(-30, -30, 60, 60);

      raf = requestAnimationFrame(draw);
    };
    raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, []);

  // Show what the pure projection function produces for the current option.
  useEffect(() => {
    if (perspective <= 0) setProjected("");
  }, [perspective]);

  void projectToCanvas2D; // referenced in docs: the step above is this function, applied per frame

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div ref={handle.ref}>
        <canvas ref={canvasRef} width={420} height={180} />
      </div>
      {projected !== "" && <code style={{ fontSize: 11, color: "#9ca3af" }}>CTM: {projected}</code>}
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/Canvas 2D Adapter",
  component: CanvasTargetStory,
  args: {
    duration: 1800,
    perspective: 400,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    perspective: { control: { type: "range", min: 0, max: 1200, step: 50 } },
  },
} satisfies Meta<typeof CanvasTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The Canvas 2D section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * a 4×4 matrix cannot land on a 2D context raw, so the adapter projects it
 * through a perspective divide and installs the fitted affine with
 * \`setTransform\` — replacing the CTM deterministically each frame (§17.3).
 * Z motion becomes visible scale/offset in the drawing.
 */
export const ProjectedMotion: Story = {};
`})})})),g=[`ProjectedMotion`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source},description:{story:`The Canvas 2D section of the
[Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
a 4×4 matrix cannot land on a 2D context raw, so the adapter projects it
through a perspective divide and installs the fitted affine with
\`setTransform\` — replacing the CTM deterministically each frame (§17.3).
Z motion becomes visible scale/offset in the drawing.`,...h.parameters?.docs?.description}}}})))()}_();export{h as ProjectedMotion,g as __namedExportsOrder,m as default};