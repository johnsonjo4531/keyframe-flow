import{n as e}from"./rolldown-runtime-sJBDdmOt.js";import{n as t,p as n}from"./iframe-CE9T6iTY.js";import{i as r,r as i,s as a,t as o}from"./src-B0K7CDl1.js";import{r as s,t as c}from"./react-C8WRvr0x.js";function l(){let e=(0,d.useMemo)(()=>a().translate(100,0).rotateZ(Math.PI/2),[]),t=(0,d.useMemo)(()=>a().rotateZ(Math.PI/2).translate(100,0),[]);return(0,f.jsxs)(`div`,{style:{display:`flex`,gap:24},children:[(0,f.jsx)(u,{label:`crane — translate, then rotate`,to:e,gradient:`linear-gradient(135deg, #f97316, #db2777)`}),(0,f.jsx)(u,{label:`orbit — rotate, then translate`,to:t,gradient:`linear-gradient(135deg, #0ea5e9, #22c55e)`})]})}function u({label:e,to:t,gradient:n}){let o=(0,d.useMemo)(()=>r.from({from:a(),to:t,duration:1200}),[t]),c=(0,d.useCallback)(e=>i.html(e),[]),l=s(o,{autoplay:!0,iterations:`infinite`,direction:`alternate`,makeTarget:c}),u=(0,d.useMemo)(()=>t.toMatrix(),[t]);return(0,f.jsxs)(`div`,{style:{display:`grid`,justifyItems:`center`},children:[(0,f.jsx)(`p`,{style:{fontSize:12,margin:`0 0 4px`,textAlign:`center`,maxWidth:200},children:e}),(0,f.jsx)(`div`,{style:{width:200,height:200,position:`relative`},children:(0,f.jsx)(`div`,{ref:l.ref,style:{position:`absolute`,left:`50%`,top:`50%`,width:48,height:48,marginLeft:-24,marginTop:-24,borderRadius:10,background:n}})}),(0,f.jsxs)(`code`,{style:{fontSize:11},children:[`translation (`,u.el(12).toFixed(0),`, `,u.el(13).toFixed(0),`)`]})]})}var d,f,p,m,h;function g(){return(g=e((()=>{o(),d=n(),c(),f=t(),p={title:`Guides/Core Concepts`,component:l},m={},typeof p==`object`&&p&&(p.parameters=Object.assign({},p.parameters,{docs:Object.assign({},p.parameters&&p.parameters.docs,{source:Object.assign({},p.parameters&&p.parameters.docs&&p.parameters.docs.source,{code:`import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Composition order from the
 * [Core concepts guide](https://johnsonjo4531.github.io/keyframe-flow/docs/core-concepts/)
 * — the \`crane\` and \`orbit\` snippets running side by side. Fluent calls apply
 * in local space: \`translate → rotateZ\` extends a crane arm then swings it,
 * while \`rotateZ → translate\` orbits the original origin. Both boxes animate
 * from identity to their composed result, so the different endpoints make the
 * order-dependence of \`M ← M × Op\` visible; the readouts show each matrix's
 * translation column (el 12/13, column-major).
 */
function CraneOrbitPair(): React.ReactElement {
  const crane = useMemo(
    () =>
      transform()
        .translate(100, 0)
        .rotateZ(Math.PI / 2),
    [],
  );
  const orbit = useMemo(
    () =>
      transform()
        .rotateZ(Math.PI / 2)
        .translate(100, 0),
    [],
  );

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <ComposedBox
        label="crane — translate, then rotate"
        to={crane}
        gradient="linear-gradient(135deg, #f97316, #db2777)"
      />
      <ComposedBox
        label="orbit — rotate, then translate"
        to={orbit}
        gradient="linear-gradient(135deg, #0ea5e9, #22c55e)"
      />
    </div>
  );
}

function ComposedBox({
  label,
  to,
  gradient,
}: {
  readonly label: string;
  readonly to: ReturnType<typeof transform>;
  readonly gradient: string;
}): React.ReactElement {
  const animation = useMemo(() => Animation.from({ from: transform(), to, duration: 1200 }), [to]);
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // sweep back and forth so the endpoints stay visible
    direction: "alternate",
    makeTarget,
  });

  const matrix = useMemo(() => to.toMatrix(), [to]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <p style={{ fontSize: 12, margin: "0 0 4px", textAlign: "center", maxWidth: 200 }}>{label}</p>
      <div style={{ width: 200, height: 200, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 48,
            height: 48,
            marginLeft: -24,
            marginTop: -24,
            borderRadius: 10,
            background: gradient,
          }}
        />
      </div>
      <code style={{ fontSize: 11 }}>
        translation ({matrix.el(12).toFixed(0)}, {matrix.el(13).toFixed(0)})
      </code>
    </div>
  );
}

const meta = {
  title: "Guides/Core Concepts",
  component: CraneOrbitPair,
} satisfies Meta<typeof CraneOrbitPair>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Same operations, opposite order — two different endpoints (§4.4). */
export const CraneVsOrbit: Story = {};
`,originalSource:`import { Animation, target, transform } from "keyframe-flow";
import type * as React from "react";
import type { Meta, StoryObj } from "@storybook/react";
import { useCallback, useMemo } from "react";
import { useKeyframePlayback } from "keyframe-flow/react";

/**
 * Composition order from the
 * [Core concepts guide](https://johnsonjo4531.github.io/keyframe-flow/docs/core-concepts/)
 * — the \`crane\` and \`orbit\` snippets running side by side. Fluent calls apply
 * in local space: \`translate → rotateZ\` extends a crane arm then swings it,
 * while \`rotateZ → translate\` orbits the original origin. Both boxes animate
 * from identity to their composed result, so the different endpoints make the
 * order-dependence of \`M ← M × Op\` visible; the readouts show each matrix's
 * translation column (el 12/13, column-major).
 */
function CraneOrbitPair(): React.ReactElement {
  const crane = useMemo(
    () =>
      transform()
        .translate(100, 0)
        .rotateZ(Math.PI / 2),
    [],
  );
  const orbit = useMemo(
    () =>
      transform()
        .rotateZ(Math.PI / 2)
        .translate(100, 0),
    [],
  );

  return (
    <div style={{ display: "flex", gap: 24 }}>
      <ComposedBox
        label="crane — translate, then rotate"
        to={crane}
        gradient="linear-gradient(135deg, #f97316, #db2777)"
      />
      <ComposedBox
        label="orbit — rotate, then translate"
        to={orbit}
        gradient="linear-gradient(135deg, #0ea5e9, #22c55e)"
      />
    </div>
  );
}

function ComposedBox({
  label,
  to,
  gradient,
}: {
  readonly label: string;
  readonly to: ReturnType<typeof transform>;
  readonly gradient: string;
}): React.ReactElement {
  const animation = useMemo(() => Animation.from({ from: transform(), to, duration: 1200 }), [to]);
  const makeTarget = useCallback((host: HTMLElement) => target.html(host), []);
  const handle = useKeyframePlayback(animation, {
    autoplay: true,
    iterations: "infinite", // sweep back and forth so the endpoints stay visible
    direction: "alternate",
    makeTarget,
  });

  const matrix = useMemo(() => to.toMatrix(), [to]);

  return (
    <div style={{ display: "grid", justifyItems: "center" }}>
      <p style={{ fontSize: 12, margin: "0 0 4px", textAlign: "center", maxWidth: 200 }}>{label}</p>
      <div style={{ width: 200, height: 200, position: "relative" }}>
        <div
          ref={handle.ref}
          style={{
            position: "absolute",
            left: "50%",
            top: "50%",
            width: 48,
            height: 48,
            marginLeft: -24,
            marginTop: -24,
            borderRadius: 10,
            background: gradient,
          }}
        />
      </div>
      <code style={{ fontSize: 11 }}>
        translation ({matrix.el(12).toFixed(0)}, {matrix.el(13).toFixed(0)})
      </code>
    </div>
  );
}

const meta = {
  title: "Guides/Core Concepts",
  component: CraneOrbitPair,
} satisfies Meta<typeof CraneOrbitPair>;

export default meta;
type Story = StoryObj<typeof meta>;

/** Same operations, opposite order — two different endpoints (§4.4). */
export const CraneVsOrbit: Story = {};
`})})})),h=[`CraneVsOrbit`],m.parameters={...m.parameters,docs:{...m.parameters?.docs,source:{originalSource:`{}`,...m.parameters?.docs?.source},description:{story:`Same operations, opposite order — two different endpoints (§4.4).`,...m.parameters?.docs?.description}}}})))()}g();export{m as CraneVsOrbit,h as __namedExportsOrder,p as default};