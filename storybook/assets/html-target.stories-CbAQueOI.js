import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-BjydkunC.js";import{i as r,r as i,t as a}from"./src-CIE5dN4r.js";import{i as o,n as s,r as c,t as l}from"./playback-story-5Ss6VQ81.js";function u({duration:e,origin:t}){let[n,a]=(0,d.useState)(``),c=o(()=>r.from({from:{position:[-100,-30,0],rotation:[0,0,0]},to:{position:[100,30,0],rotation:[0,0,Math.PI/4]},duration:e,easing:`ease-in-out`}),e=>i.html(e,t==="default"?void 0:{transformOrigin:t}),[e,t]);return(0,d.useEffect)(()=>{let e=c.hostRef.current;if(e===null)return;let t=0,n=()=>{a(e.style.transform.slice(0,64)),c.state===`running`&&(t=requestAnimationFrame(n))};return n(),()=>cancelAnimationFrame(t)},[c]),(0,f.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,f.jsx)(`div`,{style:{width:360,height:160,position:`relative`},children:(0,f.jsx)(`div`,{ref:c.hostRef,style:{position:`absolute`,left:`50%`,top:`50%`,width:72,height:72,marginLeft:-36,marginTop:-36,borderRadius:12,background:`linear-gradient(135deg, #06b6d4, #3b82f6)`}})}),(0,f.jsxs)(`code`,{style:{fontSize:11,color:`#9ca3af`},children:[n,`…`]}),(0,f.jsx)(s,{handle:c}),(0,f.jsx)(l,{handle:c})]})}var d,f,p,m,h;function g(){return(g=e((()=>{a(),d=n(),c(),f=t(),p={title:`Targets/HTML Adapter`,component:u,args:{duration:1400,origin:`default`},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}},origin:{control:`select`,options:[`default`,`0 0`,`center bottom`]}}},m={},typeof p==`object`&&p&&(p.parameters=Object.assign({},p.parameters,{docs:Object.assign({},p.parameters&&p.parameters.docs,{source:Object.assign({},p.parameters&&p.parameters.docs&&p.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * HTML adapter (§17): writes CSS \`matrix3d()\` values in column-major order.
 * The adapter owns the inline \`transform\` property — any pre-existing value
 * is replaced on the first evaluated frame (§17.3).
 */
function HtmlTargetStory({
  duration,
  origin,
}: {
  duration: number;
  origin: string;
}): React.ReactElement {
  const [lastTransform, setLastTransform] = useState("");
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-100, -30, 0], rotation: [0, 0, 0] },
        to: { position: [100, 30, 0], rotation: [0, 0, Math.PI / 4] },
        duration,
        easing: "ease-in-out",
      }),
    (host) => target.html(host, origin === "default" ? undefined : { transformOrigin: origin }),
    [duration, origin],
  );

  // Reflect the CSS the adapter actually wrote — browser-parsed truth.
  useEffect(() => {
    const host = handle.hostRef.current;
    if (host === null) return;
    let raf = 0;
    const poll = (): void => {
      setLastTransform(host.style.transform.slice(0, 64));
      if (handle.state === "running") raf = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(raf);
  }, [handle]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 160, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
          }}
        />
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>{lastTransform}…</code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/HTML Adapter",
  component: HtmlTargetStory,
  args: { duration: 1400, origin: "default" },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    origin: { control: "select", options: ["default", "0 0", "center bottom"] },
  },
} satisfies Meta<typeof HtmlTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live \`matrix3d()\` output with an optional transform-origin (§17.3). */
export const Matrix3D: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useEffect, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * HTML adapter (§17): writes CSS \`matrix3d()\` values in column-major order.
 * The adapter owns the inline \`transform\` property — any pre-existing value
 * is replaced on the first evaluated frame (§17.3).
 */
function HtmlTargetStory({
  duration,
  origin,
}: {
  duration: number;
  origin: string;
}): React.ReactElement {
  const [lastTransform, setLastTransform] = useState("");
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-100, -30, 0], rotation: [0, 0, 0] },
        to: { position: [100, 30, 0], rotation: [0, 0, Math.PI / 4] },
        duration,
        easing: "ease-in-out",
      }),
    (host) => target.html(host, origin === "default" ? undefined : { transformOrigin: origin }),
    [duration, origin],
  );

  // Reflect the CSS the adapter actually wrote — browser-parsed truth.
  useEffect(() => {
    const host = handle.hostRef.current;
    if (host === null) return;
    let raf = 0;
    const poll = (): void => {
      setLastTransform(host.style.transform.slice(0, 64));
      if (handle.state === "running") raf = requestAnimationFrame(poll);
    };
    poll();
    return () => cancelAnimationFrame(raf);
  }, [handle]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 360, height: 160, position: "relative" }}>
        <div
          ref={handle.hostRef}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #06b6d4, #3b82f6)",
          }}
        />
      </div>
      <code style={{ fontSize: 11, color: "#9ca3af" }}>{lastTransform}…</code>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/HTML Adapter",
  component: HtmlTargetStory,
  args: { duration: 1400, origin: "default" },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
    origin: { control: "select", options: ["default", "0 0", "center bottom"] },
  },
} satisfies Meta<typeof HtmlTargetStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Live \`matrix3d()\` output with an optional transform-origin (§17.3). */
export const Matrix3D: Story = {};
`})})})),h=[`Matrix3D`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:"Live `matrix3d()` output with an optional transform-origin (§17.3).",...m.parameters?.docs?.description}}}})))()}g();export{m as Matrix3D,h as __namedExportsOrder,p as default};