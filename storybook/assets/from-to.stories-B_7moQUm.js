import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,s as a,t as o}from"./src-B0K7CDl1.js";import{n as s,r as c,t as l}from"./playback-story-Dz0vCChe.js";import{r as u,t as d}from"./react-C8WRvr0x.js";function f({duration:e}){let t=(0,p.useMemo)(()=>r.from({from:a().translate(0,20),to:a(),duration:e}),[e]),n=(0,p.useCallback)(e=>i.html(e),[]),o=u(t,{autoplay:!0,iterations:`infinite`,direction:`alternate`,makeTarget:n});return(0,m.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,m.jsx)(`div`,{style:{width:320,height:160,position:`relative`},children:(0,m.jsx)(`div`,{ref:o.ref,style:{position:`absolute`,left:`50%`,top:`50%`,width:72,height:72,marginLeft:-36,marginTop:-36,borderRadius:12,background:`linear-gradient(135deg, #f97316, #db2777)`}})}),(0,m.jsx)(s,{handle:o}),(0,m.jsx)(l,{handle:o})]})}var p,m,h,g,_;function v(){return(v=e((()=>{o(),p=n(),c(),d(),m=t(),h={title:`Authoring/From To`,component:f,args:{duration:300},argTypes:{duration:{control:{type:`range`,min:100,max:5e3,step:100}}}},g={},typeof h==`object`&&h&&(h.parameters=Object.assign({},h.parameters,{docs:Object.assign({},h.parameters&&h.parameters.docs,{source:Object.assign({},h.parameters&&h.parameters.docs&&h.parameters.docs.source,{code:`import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * From/to definitions (§5.2), mirroring the \`fadeUp\` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * an explicit start transform (\`transform().translate(0, 20)\`), an end
 * transform (identity), and a duration of 300 ms. The definition is immutable
 * and reusable; everything below it — playback, transport, readout — is demo
 * chrome. \`iterations: "infinite"\` with \`direction: "alternate"\` only loops
 * the short snippet so it stays visible without pressing play again.
 */
function FromToStory({ duration }: { duration: number }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: transform().translate(0, 20), // start 20 px below the end pose
        to: transform(), // identity — where everything ends up
        duration, // milliseconds; finite and non-negative (§6.2)
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // loop the 300 ms snippet for demo visibility
    direction: "alternate",
    makeTarget,
  });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 160, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #f97316, #db2777)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/From To",
  component: FromToStory,
  args: {
    duration: 300, // the guide's fadeUp duration
  },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof FromToStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's \`fadeUp\`: identity → up-and-settle over an explicit from/to. */
export const FadeUp: Story = {};
`,originalSource:`import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { Readout, Transport } from "../playback-story";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * From/to definitions (§5.2), mirroring the \`fadeUp\` snippet in the
 * [Animation authoring guide](https://johnsonjo4531.github.io/keyframe-flow/docs/animation-authoring/):
 * an explicit start transform (\`transform().translate(0, 20)\`), an end
 * transform (identity), and a duration of 300 ms. The definition is immutable
 * and reusable; everything below it — playback, transport, readout — is demo
 * chrome. \`iterations: "infinite"\` with \`direction: "alternate"\` only loops
 * the short snippet so it stays visible without pressing play again.
 */
function FromToStory({ duration }: { duration: number }): React.ReactElement {
  const animation = useMemo(
    () =>
      Animation.from({
        from: transform().translate(0, 20), // start 20 px below the end pose
        to: transform(), // identity — where everything ends up
        duration, // milliseconds; finite and non-negative (§6.2)
      }),
    [duration],
  );
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // loop the 300 ms snippet for demo visibility
    direction: "alternate",
    makeTarget,
  });

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <div style={{ width: 320, height: 160, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 72,
            height: 72,
            marginLeft: -36,
            marginTop: -36,
            borderRadius: 12,
            background: "linear-gradient(135deg, #f97316, #db2777)",
          }}
        />
      </div>
      <Transport handle={handle} />
      <Readout handle={handle} />
    </div>
  );
}

const meta = {
  title: "Authoring/From To",
  component: FromToStory,
  args: {
    duration: 300, // the guide's fadeUp duration
  },
  argTypes: {
    duration: { control: { type: "range", min: 100, max: 5000, step: 100 } },
  },
} satisfies Meta<typeof FromToStory>;

export default meta;
type Story = StoryObj<typeof meta>;

/** The guide's \`fadeUp\`: identity → up-and-settle over an explicit from/to. */
export const FadeUp: Story = {};
`})})})),_=[`FadeUp`],g.parameters={...g.parameters,docs:{...g.parameters?.docs,source:{originalSource:`{}`,...g.parameters?.docs?.source},description:{story:"The guide's `fadeUp`: identity → up-and-settle over an explicit from/to.",...g.parameters?.docs?.description}}}})))()}v();export{g as FadeUp,_ as __namedExportsOrder,h as default};