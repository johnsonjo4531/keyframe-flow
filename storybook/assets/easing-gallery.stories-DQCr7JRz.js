import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,t as i}from"./src-B0K7CDl1.js";function a({name:e,custom:t}){let n=(0,o.useRef)(null);return(0,o.useEffect)(()=>{let i=n.current;if(i===null)return;let a=i.getContext(`2d`);if(a===null)return;let o=r.from({from:{position:[0,0,0]},to:{position:[1,0,0]},duration:1,easing:t?l:e}),s=i.width,c=i.height;a.clearRect(0,0,s,c),a.strokeStyle=`#8884`,a.strokeRect(.5,.5,s-1,c-1),a.beginPath();for(let e=0;e<=96;e++){let t=e/96,n=o.sampleProgress(t).components.position.x,r=t*s,i=c-n*(c-8)-4;e===0?a.moveTo(r,i):a.lineTo(r,i)}a.strokeStyle=`#6366f1`,a.lineWidth=2,a.stroke()},[e,t]),(0,s.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`,gap:12},children:[(0,s.jsx)(`canvas`,{ref:n,width:480,height:200,style:{maxWidth:`100%`}}),(0,s.jsxs)(`code`,{style:{fontSize:12},children:[`easing: `,t?`(custom function — easeOutBack)`:JSON.stringify(e)]})]})}var o,s,c,l,u,d,f;function p(){return(p=e((()=>{i(),o=n(),s=t(),c=`linear.ease.ease-in.ease-out.ease-in-out.ease-in-sine.ease-out-sine.ease-in-out-sine.ease-in-quad.ease-out-quad.ease-in-out-quad.ease-in-cubic.ease-out-cubic.ease-in-out-cubic.ease-in-quart.ease-out-quart.ease-in-out-quart.ease-in-quint.ease-out-quint.ease-in-out-quint.ease-in-expo.ease-out-expo.ease-in-out-expo.ease-in-circ.ease-out-circ.ease-in-out-circ`.split(`.`),l=e=>{let t=e-1;return t*t*(2.70158*t+1.70158)+1},u={title:`Easing/Easing Gallery`,component:a,args:{name:`ease-in-out-cubic`,custom:!1},argTypes:{name:{control:`select`,options:c},custom:{control:`boolean`}}},d={},typeof u==`object`&&u&&(u.parameters=Object.assign({},u.parameters,{docs:Object.assign({},u.parameters&&u.parameters.docs,{source:Object.assign({},u.parameters&&u.parameters.docs&&u.parameters.docs.source,{code:`import { Animation } from "keyframe-flow";
import type { EasingName } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";

const NAMES: EasingName[] = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "ease-in-sine",
  "ease-out-sine",
  "ease-in-out-sine",
  "ease-in-quad",
  "ease-out-quad",
  "ease-in-out-quad",
  "ease-in-cubic",
  "ease-out-cubic",
  "ease-in-out-cubic",
  "ease-in-quart",
  "ease-out-quart",
  "ease-in-out-quart",
  "ease-in-quint",
  "ease-out-quint",
  "ease-in-out-quint",
  "ease-in-expo",
  "ease-out-expo",
  "ease-in-out-expo",
  "ease-in-circ",
  "ease-out-circ",
  "ease-in-out-circ",
];

/** Custom easing — no registration required (§8). */
const overshoot = (t: number): number => {
  const c = 1.70158;
  const u = t - 1;
  return u * u * ((c + 1) * u + c) + 1;
};

/**
 * Easing (§8): every named curve plus custom functions. The curve plot is
 * produced by manual sampling (§10) — \`sampleProgress\` over a zero-to-one
 * animation of the easing itself.
 */
function EasingGalleryStory({
  name,
  custom,
}: {
  name: EasingName;
  custom: boolean;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    // A pure-sampling demo: no playback, no scheduler, no render target.
    const probe = Animation.from({
      from: { position: [0, 0, 0] },
      to: { position: [1, 0, 0] },
      duration: 1,
      easing: custom ? overshoot : name,
    });

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#8884";
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    ctx.beginPath();
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const eased = probe.sampleProgress(t).components.position.x; // ∈ [0,1] (+overshoot)
      const x = t * w;
      const y = h - eased * (h - 8) - 4; // flip Y for screen space
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [name, custom]);

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <canvas ref={canvasRef} width={480} height={200} style={{ maxWidth: "100%" }} />
      <code style={{ fontSize: 12 }}>
        easing: {custom ? "(custom function — easeOutBack)" : JSON.stringify(name)}
      </code>
    </div>
  );
}

const meta = {
  title: "Easing/Easing Gallery",
  component: EasingGalleryStory,
  args: {
    name: "ease-in-out-cubic" as EasingName,
    custom: false,
  },
  argTypes: {
    name: { control: "select", options: NAMES },
    custom: { control: "boolean" },
  },
} satisfies Meta<typeof EasingGalleryStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The named-easings and custom-easings sections of the
 * [Easing & interpolation guide](https://johnsonjo4531.github.io/keyframe-flow/docs/easing-interpolation/),
 * plotted live: pick any of the 26 built-ins with the \`name\` control, or flip
 * \`custom\` on to see an easing that is just a \`(progress) => number\` function
 * — no registration step (§8). The curve is drawn by pure manual sampling; no
 * playback is involved.
 */
export const Curves: Story = {};
`,originalSource:`import { Animation } from "keyframe-flow";
import type { EasingName } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useRef } from "react";
import type { Meta, StoryObj } from "@storybook/react";

const NAMES: EasingName[] = [
  "linear",
  "ease",
  "ease-in",
  "ease-out",
  "ease-in-out",
  "ease-in-sine",
  "ease-out-sine",
  "ease-in-out-sine",
  "ease-in-quad",
  "ease-out-quad",
  "ease-in-out-quad",
  "ease-in-cubic",
  "ease-out-cubic",
  "ease-in-out-cubic",
  "ease-in-quart",
  "ease-out-quart",
  "ease-in-out-quart",
  "ease-in-quint",
  "ease-out-quint",
  "ease-in-out-quint",
  "ease-in-expo",
  "ease-out-expo",
  "ease-in-out-expo",
  "ease-in-circ",
  "ease-out-circ",
  "ease-in-out-circ",
];

/** Custom easing — no registration required (§8). */
const overshoot = (t: number): number => {
  const c = 1.70158;
  const u = t - 1;
  return u * u * ((c + 1) * u + c) + 1;
};

/**
 * Easing (§8): every named curve plus custom functions. The curve plot is
 * produced by manual sampling (§10) — \`sampleProgress\` over a zero-to-one
 * animation of the easing itself.
 */
function EasingGalleryStory({
  name,
  custom,
}: {
  name: EasingName;
  custom: boolean;
}): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas === null) return;
    const ctx = canvas.getContext("2d");
    if (ctx === null) return;

    // A pure-sampling demo: no playback, no scheduler, no render target.
    const probe = Animation.from({
      from: { position: [0, 0, 0] },
      to: { position: [1, 0, 0] },
      duration: 1,
      easing: custom ? overshoot : name,
    });

    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.strokeStyle = "#8884";
    ctx.strokeRect(0.5, 0.5, w - 1, h - 1);

    ctx.beginPath();
    const steps = 96;
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const eased = probe.sampleProgress(t).components.position.x; // ∈ [0,1] (+overshoot)
      const x = t * w;
      const y = h - eased * (h - 8) - 4; // flip Y for screen space
      if (i === 0) ctx.moveTo(x, y);
      else ctx.lineTo(x, y);
    }
    ctx.strokeStyle = "#6366f1";
    ctx.lineWidth = 2;
    ctx.stroke();
  }, [name, custom]);

  return (
    <div style={{ display: "grid", justifyItems: "center", gap: 12 }}>
      <canvas ref={canvasRef} width={480} height={200} style={{ maxWidth: "100%" }} />
      <code style={{ fontSize: 12 }}>
        easing: {custom ? "(custom function — easeOutBack)" : JSON.stringify(name)}
      </code>
    </div>
  );
}

const meta = {
  title: "Easing/Easing Gallery",
  component: EasingGalleryStory,
  args: {
    name: "ease-in-out-cubic" as EasingName,
    custom: false,
  },
  argTypes: {
    name: { control: "select", options: NAMES },
    custom: { control: "boolean" },
  },
} satisfies Meta<typeof EasingGalleryStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The named-easings and custom-easings sections of the
 * [Easing & interpolation guide](https://johnsonjo4531.github.io/keyframe-flow/docs/easing-interpolation/),
 * plotted live: pick any of the 26 built-ins with the \`name\` control, or flip
 * \`custom\` on to see an easing that is just a \`(progress) => number\` function
 * — no registration step (§8). The curve is drawn by pure manual sampling; no
 * playback is involved.
 */
export const Curves: Story = {};
`})})})),f=[`Curves`],d.parameters={...d.parameters,docs:{...d.parameters?.docs,source:{originalSource:`{}`,...d.parameters?.docs?.source},description:{story:"The named-easings and custom-easings sections of the\n[Easing & interpolation guide](https://johnsonjo4531.github.io/keyframe-flow/docs/easing-interpolation/),\nplotted live: pick any of the 26 built-ins with the `name` control, or flip\n`custom` on to see an easing that is just a `(progress) => number` function\n— no registration step (§8). The curve is drawn by pure manual sampling; no\nplayback is involved.",...d.parameters?.docs?.description}}}})))()}p();export{d as Curves,f as __namedExportsOrder,u as default};