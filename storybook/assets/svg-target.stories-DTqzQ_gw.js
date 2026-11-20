import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-DXSg0uKF.js";import{i as r,r as i,t as a}from"./src-DfDWSzNz.js";import{i as o,n as s,r as c,t as l}from"./playback-story-w1_FZ1Kv.js";function u({duration:e}){let[t,n]=(0,d.useState)(``),a=o(()=>r.from({from:{position:[-90,0,0],scale:.6},to:{position:[90,0,0],scale:1.4},duration:e,easing:`ease-in-out`}),e=>{let t=e.querySelector(`g`);if(t===null)throw Error(`SVG group missing in story host.`);return i.svg(t)},[e]);return(0,d.useEffect)(()=>{let e=a.hostRef.current;if(e===null)return;let t=e.querySelector(`g`),r=0,i=()=>{n(t?.getAttribute(`transform`)??``),a.state===`running`&&(r=requestAnimationFrame(i))};return i(),()=>cancelAnimationFrame(r)},[a]),(0,f.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,f.jsx)(`div`,{ref:a.hostRef,children:(0,f.jsx)(`svg`,{width:`360`,height:`140`,viewBox:`-180 -70 360 140`,children:(0,f.jsxs)(`g`,{children:[(0,f.jsx)(`rect`,{x:-28,y:-28,width:56,height:56,rx:10,fill:`#f43f5e`}),(0,f.jsx)(`circle`,{cx:20,cy:-20,r:8,fill:`#fff`,opacity:.85})]})})}),(0,f.jsx)(`code`,{style:{fontSize:11,color:`#9ca3af`},children:t}),(0,f.jsx)(s,{handle:a}),(0,f.jsx)(l,{handle:a})]})}var d,f,p,m,h;function g(){return(g=e((()=>{a(),d=n(),c(),f=t(),p={title:`Targets/SVG Adapter`,component:u,args:{duration:1400},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}}}},m={},typeof p==`object`&&p&&(p.parameters=Object.assign({},p.parameters,{docs:Object.assign({},p.parameters&&p.parameters.docs,{source:Object.assign({},p.parameters&&p.parameters.docs&&p.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * SVG adapter (§17): writes the SVG 1.1 \`transform="matrix(a, b, c, d, e, f)"\`
 * attribute mapped from the matrix's column vectors. SVG is inherently 2D
 * affine — Z and perspective members are not expressible here.
 */
function SvgTargetStory({ duration }: { duration: number }): React.ReactElement {
  const [attribute, setAttribute] = useState("");
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-90, 0, 0], scale: 0.6 },
        to: { position: [90, 0, 0], scale: 1.4 },
        duration,
        easing: "ease-in-out",
      }),
    (host) => {
      const group = host.querySelector("g");
      if (group === null) throw new Error("SVG group missing in story host.");
      return target.svg(group);
    },
    [duration],
  );

  useEffect(() => {
    const host = handle.hostRef.current;
    if (host === null) return;
    const group = host.querySelector("g");
    let raf = 0;
    const poll = (): void => {
      setAttribute(group?.getAttribute("transform") ?? "");
      if (handle.state === "running") raf = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(raf);
  }, [handle]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div ref={handle.hostRef}>
        <svg width="360" height="140" viewBox="-180 -70 360 140">
          <g>
            <rect x={-28} y={-28} width={56} height={56} rx={10} fill="#f43f5e" />
            <circle cx={20} cy={-20} r={8} fill="#fff" opacity={0.85} />
          </g>
        </svg>
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>{attribute}</code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/SVG Adapter",
  component: SvgTargetStory,
  args: { duration: 1400 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof SvgTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live \`matrix()\` transform attribute written to an SVG group. */
export const MatrixAttribute: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * SVG adapter (§17): writes the SVG 1.1 \`transform="matrix(a, b, c, d, e, f)"\`
 * attribute mapped from the matrix's column vectors. SVG is inherently 2D
 * affine — Z and perspective members are not expressible here.
 */
function SvgTargetStory({ duration }: { duration: number }): React.ReactElement {
  const [attribute, setAttribute] = useState("");
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-90, 0, 0], scale: 0.6 },
        to: { position: [90, 0, 0], scale: 1.4 },
        duration,
        easing: "ease-in-out",
      }),
    (host) => {
      const group = host.querySelector("g");
      if (group === null) throw new Error("SVG group missing in story host.");
      return target.svg(group);
    },
    [duration],
  );

  useEffect(() => {
    const host = handle.hostRef.current;
    if (host === null) return;
    const group = host.querySelector("g");
    let raf = 0;
    const poll = (): void => {
      setAttribute(group?.getAttribute("transform") ?? "");
      if (handle.state === "running") raf = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(raf);
  }, [handle]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div ref={handle.hostRef}>
        <svg width="360" height="140" viewBox="-180 -70 360 140">
          <g>
            <rect x={-28} y={-28} width={56} height={56} rx={10} fill="#f43f5e" />
            <circle cx={20} cy={-20} r={8} fill="#fff" opacity={0.85} />
          </g>
        </svg>
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>{attribute}</code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/SVG Adapter",
  component: SvgTargetStory,
  args: { duration: 1400 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof SvgTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live \`matrix()\` transform attribute written to an SVG group. */
export const MatrixAttribute: Story = {};
`})})})),h=[`MatrixAttribute`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:"Live `matrix()` transform attribute written to an SVG group.",...m.parameters?.docs?.description}}}})))()}g();export{m as MatrixAttribute,h as __namedExportsOrder,p as default};