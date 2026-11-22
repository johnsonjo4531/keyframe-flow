import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,t as i}from"./src-B0K7CDl1.js";function a({duration:e}){let t=(0,o.useRef)(null),[n,i]=(0,o.useState)(!0);return(0,o.useEffect)(()=>{let i=t.current;if(i===null)return;let a=i.getContext(`2d`);if(a===null)return;let o=r.from({from:{position:[-1,0,0],scale:.6},to:{position:[1,0,0],scale:1.3},duration:e,easing:`ease-in-out`}),s=0,c=performance.now(),l=t=>{let n=(t-c)%e/e,{position:r,scale:u}=o.sampleProgress(n).components,d=i.width,f=i.height;a.clearRect(0,0,d,f),a.save(),a.translate(d/2+r.x*(d/2-60),f/2+Math.sin(n*Math.PI*2)*40),a.scale(u.x,u.y),a.fillStyle=`#10b981`,a.fillRect(-24,-24,48,48),a.restore(),a.font=`12px ui-monospace, monospace`,a.fillStyle=`#999`,a.fillText(`progress ${n.toFixed(2)} → x ${r.x.toFixed(2)}, scale ${u.x.toFixed(2)}`,8,f-10),s=requestAnimationFrame(l)};return n&&(s=requestAnimationFrame(l)),()=>cancelAnimationFrame(s)},[e,n]),(0,s.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`,gap:12},children:[(0,s.jsx)(`canvas`,{ref:t,width:480,height:220,style:{maxWidth:`100%`}}),(0,s.jsxs)(`label`,{style:{fontSize:13},children:[(0,s.jsx)(`input`,{type:`checkbox`,checked:n,onChange:e=>i(e.target.checked)}),` `,`host loop running`]})]})}var o,s,c,l,u;function d(){return(d=e((()=>{i(),o=n(),s=t(),c={title:`Sampling/Manual Render Loop`,component:a,args:{duration:2e3},argTypes:{duration:{control:{type:`range`,min:500,max:6e3,step:100}}}},l={},typeof c==`object`&&c&&(c.parameters=Object.assign({},c.parameters,{docs:Object.assign({},c.parameters&&c.parameters.docs,{source:Object.assign({},c.parameters&&c.parameters.docs&&c.parameters.docs.source,{code:`import { Animation } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Manual sampling in an external render loop (§10.3): no \`attach\`, no
 * playback instance, no scheduler — the host owns time and calls
 * \`sampleProgress\` each frame with its own progress value.
 */
function ManualLoopStory({ duration }: { duration: number }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    const animation = Animation.from({
      from: { position: [-1, 0, 0], scale: 0.6 },
      to: { position: [1, 0, 0], scale: 1.3 },
      duration,
      easing: "ease-in-out",
    });

    let raf = 0;
    const start = performance.now();
    const draw = (now: number): void => {
      const progress = ((now - start) % duration) / duration; // host-owned time
      const transform = animation.sampleProgress(progress); // §10.2 — pure evaluation
      const { position, scale } = transform.components;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(
        w / 2 + position.x * (w / 2 - 60),
        h / 2 + Math.sin(progress * Math.PI * 2) * 40,
      );
      ctx.scale(scale.x, scale.y);
      ctx.fillStyle = "#10b981";
      ctx.fillRect(-24, -24, 48, 48);
      ctx.restore();

      // The same timeline sampled as text — sampling is just a function call.
      ctx.font = "12px ui-monospace, monospace";
      ctx.fillStyle = "#999";
      ctx.fillText(
        \`progress \${progress.toFixed(2)} → x \${position.x.toFixed(2)}, scale \${scale.x.toFixed(2)}\`,
        8,
        h - 10,
      );

      raf = requestAnimationFrame(draw);
    };

    if (running) raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [duration, running]);

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <canvas ref={canvasRef} width={480} height={220} style={{ maxWidth: "100%" }} />
      <label style={{ fontSize: 13 }}>
        <input type="checkbox" checked={running} onChange={(e) => setRunning(e.target.checked)} />{" "}
        host loop running
      </label>
    </div>
  );
}

const meta = {
  title: "Sampling/Manual Render Loop",
  component: ManualLoopStory,
  args: {
    duration: 2000,
  },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 6000, step: 100 } },
  },
} satisfies Meta<typeof ManualLoopStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The "Sample without playing" idea from
 * [Getting Started](https://johnsonjo4531.github.io/keyframe-flow/docs/getting-started/)
 * taken further: a Canvas driven entirely by the story's own
 * \`requestAnimationFrame\` loop calling \`animation.sampleProgress(p)\` — no
 * attach, no playback instance, no scheduler (§10.3). For hosts that already
 * run a frame loop.
 */
export const ExternalLoop: Story = {};
`,originalSource:`import { Animation } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useRef, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

/**
 * Manual sampling in an external render loop (§10.3): no \`attach\`, no
 * playback instance, no scheduler — the host owns time and calls
 * \`sampleProgress\` each frame with its own progress value.
 */
function ManualLoopStory({ duration }: { duration: number }): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [running, setRunning] = useState(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    const animation = Animation.from({
      from: { position: [-1, 0, 0], scale: 0.6 },
      to: { position: [1, 0, 0], scale: 1.3 },
      duration,
      easing: "ease-in-out",
    });

    let raf = 0;
    const start = performance.now();
    const draw = (now: number): void => {
      const progress = ((now - start) % duration) / duration; // host-owned time
      const transform = animation.sampleProgress(progress); // §10.2 — pure evaluation
      const { position, scale } = transform.components;

      const w = canvas.width;
      const h = canvas.height;
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(
        w / 2 + position.x * (w / 2 - 60),
        h / 2 + Math.sin(progress * Math.PI * 2) * 40,
      );
      ctx.scale(scale.x, scale.y);
      ctx.fillStyle = "#10b981";
      ctx.fillRect(-24, -24, 48, 48);
      ctx.restore();

      // The same timeline sampled as text — sampling is just a function call.
      ctx.font = "12px ui-monospace, monospace";
      ctx.fillStyle = "#999";
      ctx.fillText(
        \`progress \${progress.toFixed(2)} → x \${position.x.toFixed(2)}, scale \${scale.x.toFixed(2)}\`,
        8,
        h - 10,
      );

      raf = requestAnimationFrame(draw);
    };

    if (running) raf = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(raf);
  }, [duration, running]);

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <canvas ref={canvasRef} width={480} height={220} style={{ maxWidth: "100%" }} />
      <label style={{ fontSize: 13 }}>
        <input type="checkbox" checked={running} onChange={(e) => setRunning(e.target.checked)} />{" "}
        host loop running
      </label>
    </div>
  );
}

const meta = {
  title: "Sampling/Manual Render Loop",
  component: ManualLoopStory,
  args: {
    duration: 2000,
  },
  argTypes: {
    duration: { control: { type: "range", min: 500, max: 6000, step: 100 } },
  },
} satisfies Meta<typeof ManualLoopStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The "Sample without playing" idea from
 * [Getting Started](https://johnsonjo4531.github.io/keyframe-flow/docs/getting-started/)
 * taken further: a Canvas driven entirely by the story's own
 * \`requestAnimationFrame\` loop calling \`animation.sampleProgress(p)\` — no
 * attach, no playback instance, no scheduler (§10.3). For hosts that already
 * run a frame loop.
 */
export const ExternalLoop: Story = {};
`})})})),u=[`ExternalLoop`],l.parameters={...l.parameters,docs:{...l.parameters?.docs,source:{originalSource:`{}`,...l.parameters?.docs?.source},description:{story:`The "Sample without playing" idea from
[Getting Started](https://johnsonjo4531.github.io/keyframe-flow/docs/getting-started/)
taken further: a Canvas driven entirely by the story's own
\`requestAnimationFrame\` loop calling \`animation.sampleProgress(p)\` — no
attach, no playback instance, no scheduler (§10.3). For hosts that already
run a frame loop.`,...l.parameters?.docs?.description}}}})))()}d();export{l as ExternalLoop,u as __namedExportsOrder,c as default};