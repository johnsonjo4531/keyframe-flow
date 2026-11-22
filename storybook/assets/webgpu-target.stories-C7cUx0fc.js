import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,t as a}from"./src-B0K7CDl1.js";import{n as o,r as s,t as c}from"./playback-story-Dz0vCChe.js";import{r as l,t as u}from"./react-C8WRvr0x.js";function d({duration:e}){let[t,n]=(0,f.useState)(``),a=(0,f.useMemo)(()=>r.from({from:{position:[-100,-30,0],scale:.6},to:{position:[100,30,0],rotation:[0,Math.PI/4,0]},duration:e,easing:`ease-in-out`}),[e]),s=(0,f.useCallback)(()=>i.webgpu({onTransform:e=>{n(Array.from(e.slice(12,15),e=>e.toFixed(1)).join(`, `))}}),[]),u=l(a,{autoplay:!0,makeTarget:s});return(0,p.jsxs)(`div`,{ref:u.ref,style:{display:`grid`,justifyItems:`center`},children:[(0,p.jsx)(`div`,{style:{width:320,height:160,display:`grid`,placeItems:`center`,border:`1px dashed #6b728055`,borderRadius:12},children:(0,p.jsxs)(`span`,{style:{fontSize:13,color:`#9ca3af`},children:[`uniform buffer translation: [`,t,`]`]})}),(0,p.jsx)(o,{handle:u}),(0,p.jsx)(c,{handle:u})]})}var f,p,m,h,g;function _(){return(_=e((()=>{a(),f=n(),s(),u(),p=t(),m={title:`Targets/WebGPU Adapter`,component:d,args:{duration:1600},argTypes:{duration:{control:{type:`range`,min:200,max:5e3,step:100}}}},h={},typeof m==`object`&&m&&(m.parameters=Object.assign({},m.parameters,{docs:Object.assign({},m.parameters&&m.parameters.docs,{source:Object.assign({},m.parameters&&m.parameters.docs&&m.parameters.docs.source,{code:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * WebGPU adapter (§3.6): like the WebGL adapter it creates no GPU resources —
 * each evaluated frame hands the host a column-major \`Float32Array\` through
 * \`onTransform\`, ready for \`queue.writeBuffer\`. This story stays device-free
 * (no \`navigator.gpu\` needed): the upload path is just an array callback, so
 * the panel shows exactly what would be written into the uniform buffer.
 */
function WebGPUSubmitStory({ duration }: { duration: number }): React.ReactElement {
  const [written, setWritten] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-100, -30, 0], scale: 0.6 },
        to: { position: [100, 30, 0], rotation: [0, Math.PI / 4, 0] },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback(
    () =>
      target.webgpu({
        onTransform: (values) => {
          // In a real renderer: device.queue.writeBuffer(uniforms, 0, values).
          setWritten(Array.from(values.slice(12, 15), (v) => v.toFixed(1)).join(", "));
        },
      }),
    [],
  );
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    // hostRef is required by useKeyframePlayback (it builds the playback from
    // a mounted host) but layout-only here — the WebGPU target ignores it.
    <div ref={handle.ref} style={{ display: "grid", justifyItems: "center" }}>
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
  args: {
    duration: 1600,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof WebGPUSubmitStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The WebGPU section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * same contract as WebGL — no device, no buffers created by the library — a
 * column-major \`Float32Array\` per frame ready for \`queue.writeBuffer\`. The
 * panel prints exactly what would be written, so the example runs without
 * \`navigator.gpu\` support.
 */
export const UniformWrite: Story = {};
`,originalSource:`import { Animation, target } from "keyframe-flow";
import type * as React from "react";
import { useCallback, useMemo, useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * WebGPU adapter (§3.6): like the WebGL adapter it creates no GPU resources —
 * each evaluated frame hands the host a column-major \`Float32Array\` through
 * \`onTransform\`, ready for \`queue.writeBuffer\`. This story stays device-free
 * (no \`navigator.gpu\` needed): the upload path is just an array callback, so
 * the panel shows exactly what would be written into the uniform buffer.
 */
function WebGPUSubmitStory({ duration }: { duration: number }): React.ReactElement {
  const [written, setWritten] = useState("");
  const animation = useMemo(
    () =>
      Animation.from({
        from: { position: [-100, -30, 0], scale: 0.6 },
        to: { position: [100, 30, 0], rotation: [0, Math.PI / 4, 0] },
        duration,
        easing: "ease-in-out",
      }),
    [duration],
  );
  const makeTarget = useCallback(
    () =>
      target.webgpu({
        onTransform: (values) => {
          // In a real renderer: device.queue.writeBuffer(uniforms, 0, values).
          setWritten(Array.from(values.slice(12, 15), (v) => v.toFixed(1)).join(", "));
        },
      }),
    [],
  );
  const handle = useKeyframePlayback(animation, { autoplay: true, makeTarget });

  return (
    // hostRef is required by useKeyframePlayback (it builds the playback from
    // a mounted host) but layout-only here — the WebGPU target ignores it.
    <div ref={handle.ref} style={{ display: "grid", justifyItems: "center" }}>
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
  args: {
    duration: 1600,
  },
  argTypes: {
    duration: { control: { type: "range", min: 200, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof WebGPUSubmitStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/**
 * The WebGPU section of the
 * [Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):
 * same contract as WebGL — no device, no buffers created by the library — a
 * column-major \`Float32Array\` per frame ready for \`queue.writeBuffer\`. The
 * panel prints exactly what would be written, so the example runs without
 * \`navigator.gpu\` support.
 */
export const UniformWrite: Story = {};
`})})})),g=[`UniformWrite`],h.parameters={...h.parameters,docs:{...h.parameters?.docs,source:{originalSource:`{}`,...h.parameters?.docs?.source},description:{story:"The WebGPU section of the\n[Render adapters guide](https://johnsonjo4531.github.io/keyframe-flow/docs/render-adapters/):\nsame contract as WebGL — no device, no buffers created by the library — a\ncolumn-major `Float32Array` per frame ready for `queue.writeBuffer`. The\npanel prints exactly what would be written, so the example runs without\n`navigator.gpu` support.",...h.parameters?.docs?.description}}}})))()}_();export{h as UniformWrite,g as __namedExportsOrder,m as default};