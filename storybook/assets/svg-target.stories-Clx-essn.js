import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,t as a}from"./src-B0K7CDl1.js";import{n as o,r as s,t as c}from"./playback-story-Dz0vCChe.js";import{r as l,t as u}from"./react-C8WRvr0x.js";function d({duration:e}){let[t,n]=(0,f.useState)(``),a=(0,f.useMemo)(()=>r.from({from:{position:[-90,0,0],scale:.6},to:{position:[90,0,0],scale:1.4},duration:e,easing:`ease-in-out`}),[e]),s=(0,f.useCallback)(e=>{let t=e.querySelector(`g`);if(t===null)throw Error(`SVG group missing in story host.`);return i.svg(t)},[]),u=l(a,{autoplay:!0,makeTarget:s});return(0,f.useEffect)(()=>{let e=u.ref.current;if(e===null)return;let t=e.querySelector(`g`),r=0,i=()=>{n(t?.getAttribute(`transform`)??``),u.state===`running`&&(r=requestAnimationFrame(i))};return i(),()=>cancelAnimationFrame(r)},[u]),(0,p.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,p.jsx)(`div`,{ref:u.ref,children:(0,p.jsx)(`svg`,{width:`360`,height:`140`,viewBox:`-180 -70 360 140`,children:(0,p.jsxs)(`g`,{children:[(0,p.jsx)(`rect`,{x:-28,y:-28,width:56,height:56,rx:10,fill:`#f43f5e`}),(0,p.jsx)(`circle`,{cx:20,cy:-20,r:8,fill:`#fff`,opacity:.85})]})})}),(0,p.jsx)(`code`,{style:{fontSize:11,color:`#9ca3af`},children:t}),(0,p.jsx)(o,{handle:u}),(0,p.jsx)(c,{handle:u})]})}var f,p,m,h,g;function _(){return(_=e((()=>{a(),f=n(),s(),u(),p=t(),m={title:`Targets/SVG Adapter`,component:d,args:{duration:1400},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}}}},h={},typeof m==`object`&&m&&(m.parameters=Object.assign({},m.parameters,{docs:Object.assign({},m.parameters&&m.parameters.docs,{source:Object.assign({},m.parameters&&m.parameters.docs&&m.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * SVG adapter (§17): writes the SVG 1.1 \`transform="matrix(a, b, c, d, e, f)"\`
 * attribute mapped from the matrix's column vectors. SVG is inherently 2D
 * affine — Z and perspective members are not expressible here.
 */
function SvgTargetStory({ duration }: { duration: number }): React.ReactElement {
  const [attribute, setAttribute] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-90, 0, 0], scale: 0.6 },
        to: { position: [90, 0, 0], scale: 1.4 },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => {
    const group = host.querySelector("g");
    if (group === null) throw new Error("SVG group missing in story host.");
    return target.svg(group);
  }, []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  useEffect(() => {
    const host = handle.ref.current;
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
      <div ref={handle.ref}>
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
  args: {
    duration: 1400,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof SvgTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The SVG section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * the adapter writes SVG 1.1's \`transform="matrix(a, b, c, d, e, f)"\` mapped
 * from the matrix's column vectors — live in the attribute readout below.
 * SVG is affine 2D: Z and perspective members cannot be expressed here.
 */
export const MatrixAttribute: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useEffect, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * SVG adapter (§17): writes the SVG 1.1 \`transform="matrix(a, b, c, d, e, f)"\`
 * attribute mapped from the matrix's column vectors. SVG is inherently 2D
 * affine — Z and perspective members are not expressible here.
 */
function SvgTargetStory({ duration }: { duration: number }): React.ReactElement {
  const [attribute, setAttribute] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-90, 0, 0], scale: 0.6 },
        to: { position: [90, 0, 0], scale: 1.4 },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => {
    const group = host.querySelector("g");
    if (group === null) throw new Error("SVG group missing in story host.");
    return target.svg(group);
  }, []);
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  useEffect(() => {
    const host = handle.ref.current;
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
      <div ref={handle.ref}>
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
  args: {
    duration: 1400,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof SvgTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The SVG section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * the adapter writes SVG 1.1's \`transform="matrix(a, b, c, d, e, f)"\` mapped
 * from the matrix's column vectors — live in the attribute readout below.
 * SVG is affine 2D: Z and perspective members cannot be expressed here.
 */
export const MatrixAttribute: Story = {};
`})})})),g=[`MatrixAttribute`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source},description:{story:`The SVG section of the
[Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
the adapter writes SVG 1.1's \`transform="matrix(a, b, c, d, e, f)"\` mapped
from the matrix's column vectors — live in the attribute readout below.
SVG is affine 2D: Z and perspective members cannot be expressed here.`,...h.parameters?.docs?.description}}}})))()}_();export{h as MatrixAttribute,g as __namedExportsOrder,m as default};