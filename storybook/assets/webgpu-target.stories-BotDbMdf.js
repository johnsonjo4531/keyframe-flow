import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-BjydkunC.js";import{i as r,r as i,t as a}from"./src-CIE5dN4r.js";import{i as o,n as s,r as c,t as l}from"./playback-story-5Ss6VQ81.js";function u({duration:e}){let[t,n]=(0,d.useState)(``),a=o(()=>r.from({from:{position:[-100,-30,0],scale:.6},to:{position:[100,30,0],rotation:[0,Math.PI/4,0]},duration:e,easing:`ease-in-out`}),()=>i.webgpu({onTransform:e=>{n(Array.from(e.slice(12,15),e=>e.toFixed(1)).join(`, `))}}),[e]);return(0,f.jsxs)(`div`,{ref:a.hostRef,style:{display:`grid`,justifyItems:`center`},children:[(0,f.jsx)(`div`,{style:{width:320,height:160,display:`grid`,placeItems:`center`,border:`1px dashed #6b728055`,borderRadius:12},children:(0,f.jsxs)(`span`,{style:{fontSize:13,color:`#9ca3af`},children:[`uniform buffer translation: [`,t,`]`]})}),(0,f.jsx)(s,{handle:a}),(0,f.jsx)(l,{handle:a})]})}var d,f,p,m,h;function g(){return(g=e((()=>{a(),d=n(),c(),f=t(),p={title:`Targets/WebGPU Adapter`,component:u,args:{duration:1600},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}}}},m={},typeof p==`object`&&p&&(p.parameters=Object.assign({},p.parameters,{docs:Object.assign({},p.parameters&&p.parameters.docs,{source:Object.assign({},p.parameters&&p.parameters.docs&&p.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * WebGPU adapter (§3.6): like the WebGL adapter it creates no GPU resources —
 * each evaluated frame hands the host a column-major \`Float32Array\` through
 * \`onTransform\`, ready for \`queue.writeBuffer\`. This story stays device-free
 * (no \`navigator.gpu\` needed): the upload path is just an array callback, so
 * the panel shows exactly what would be written into the uniform buffer.
 */
function WebGPUSubmitStory({ duration }: { duration: number }): React.ReactElement {
  const [written, setWritten] = useState("");
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-100, -30, 0], scale: 0.6 },
        to: { position: [100, 30, 0], rotation: [0, Math.PI / 4, 0] },
        duration,
        easing: "ease-in-out",
      }),
    () =>
      target.webgpu({
        onTransform: (values) => {
          // In a real renderer: device.queue.writeBuffer(uniforms, 0, values).
          setWritten(Array.from(values.slice(12, 15), (v) => v.toFixed(1)).join(", "));
        },
      }),
    [duration],
  );

  return (
    // hostRef is required by useKeyframePlayback (it builds the playback from
    // a mounted host) but layout-only here — the WebGPU target ignores it.
    <div ref={handle.hostRef} style={{ display: "grid", justifyItems: "center" }}>
      <div
        style={{
          width: 320,
          height: 160,
          display: "grid",
          placeItems: "center",
          border: "1px dashed #6b728055",
          borderRadius: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "#9ca3af" }}>
          uniform buffer translation: [{written}]
        </span>
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/WebGPU Adapter",
  component: WebGPUSubmitStory,
  args: { duration: 1600 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof WebGPUSubmitStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What \`queue.writeBuffer\` would receive, live per frame. */
export const UniformWrite: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport, useKeyframePlayback } from "../playback-story";

/**
 * WebGPU adapter (§3.6): like the WebGL adapter it creates no GPU resources —
 * each evaluated frame hands the host a column-major \`Float32Array\` through
 * \`onTransform\`, ready for \`queue.writeBuffer\`. This story stays device-free
 * (no \`navigator.gpu\` needed): the upload path is just an array callback, so
 * the panel shows exactly what would be written into the uniform buffer.
 */
function WebGPUSubmitStory({ duration }: { duration: number }): React.ReactElement {
  const [written, setWritten] = useState("");
  const handle = useKeyframePlayback(
    () =>
      Animation.from({
        from: { position: [-100, -30, 0], scale: 0.6 },
        to: { position: [100, 30, 0], rotation: [0, Math.PI / 4, 0] },
        duration,
        easing: "ease-in-out",
      }),
    () =>
      target.webgpu({
        onTransform: (values) => {
          // In a real renderer: device.queue.writeBuffer(uniforms, 0, values).
          setWritten(Array.from(values.slice(12, 15), (v) => v.toFixed(1)).join(", "));
        },
      }),
    [duration],
  );

  return (
    // hostRef is required by useKeyframePlayback (it builds the playback from
    // a mounted host) but layout-only here — the WebGPU target ignores it.
    <div ref={handle.hostRef} style={{ display: "grid", justifyItems: "center" }}>
      <div
        style={{
          width: 320,
          height: 160,
          display: "grid",
          placeItems: "center",
          border: "1px dashed #6b728055",
          borderRadius: 12,
        }}
      >
        <span style={{ fontSize: 13, color: "#9ca3af" }}>
          uniform buffer translation: [{written}]
        </span>
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Targets/WebGPU Adapter",
  component: WebGPUSubmitStory,
  args: { duration: 1600 },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof WebGPUSubmitStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** What \`queue.writeBuffer\` would receive, live per frame. */
export const UniformWrite: Story = {};
`})})})),h=[`UniformWrite`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:"What `queue.writeBuffer` would receive, live per frame.",...m.parameters?.docs?.description}}}})))()}g();export{m as UniformWrite,h as __namedExportsOrder,p as default};