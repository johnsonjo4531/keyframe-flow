import { memo, useEffect, useRef, useState } from "react";
import type * as React from "react";
import { createRoot } from "react-dom/client";
import Prism from "prismjs";
import "prismjs/components/prism-typescript";
import "prismjs/components/prism-jsx";
import "prismjs/components/prism-tsx";

import { EXAMPLES } from "./examples.ts";
import type { GalleryExample } from "./examples.ts";

/**
 * Vanilla-TypeScript examples gallery (T56). The shell is a small React app,
 * but every example itself is a pure-TypeScript module under
 * `examples/vanilla/` — no React imports anywhere in the examples; they use
 * only keyframe-flow and DOM APIs. Hash routing (`#/`, `#/example/<story-id>`)
 * keeps the built site working on any static host with no server rewrites,
 * and ids match Storybook story ids so docs pages can deep-link here.
 */

const app = document.getElementById("app");
if (app === null) throw new Error("Gallery root #app missing.");

/** Mounts a vanilla example module into a div; remounts when args change. */
function VanillaDemo({ example }: { readonly example: GalleryExample }): React.ReactElement {
  const hostRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    const host = hostRef.current;
    if (host === null) return;
    // The mount function is pure TS — the gallery just hands it a DOM node.
    const cleanup = example.mount(host, example.args);
    return () => {
      cleanup();
      host.replaceChildren();
    };
  }, [example]);

  return <div ref={hostRef} />;
}

const MemoDemo = memo(VanillaDemo);

/** Code panel with a TypeScript / React source toggle and Prism highlighting. */
function CodePanel({ example }: { readonly example: GalleryExample }): React.ReactElement {
  const [kind, setKind] = useState<"typescript" | "react">("typescript");
  const source = kind === "typescript" ? example.tsSource : example.reactSource;
  const codeRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    if (codeRef.current !== null) Prism.highlightElement(codeRef.current);
  }, [source]);

  return (
    <div className="code-panel">
      <div className="code-toolbar">
        <span className="code-filename">
          {kind === "typescript"
            ? `examples/vanilla/${example.tsFile}.ts`
            : "React twin (Storybook story)"}
        </span>
        <div className="toggle">
          <button
            type="button"
            aria-pressed={kind === "typescript"}
            onClick={() => setKind("typescript")}
          >
            TypeScript
          </button>
          <button type="button" aria-pressed={kind === "react"} onClick={() => setKind("react")}>
            React
          </button>
        </div>
      </div>
      <pre>
        <code ref={codeRef} className={kind === "react" ? "language-tsx" : "language-typescript"}>
          {source}
        </code>
      </pre>
    </div>
  );
}

function Landing(): React.ReactElement {
  const sections = new Map<string, GalleryExample[]>();
  for (const example of EXAMPLES) {
    const list = sections.get(example.section) ?? [];
    list.push(example);
    sections.set(example.section, list);
  }
  return (
    <>
      <p className="intro">
        Framework-free examples: every page runs the same animation as its Storybook twin, written
        in plain TypeScript against keyframe-flow and DOM APIs only. The code panel toggles between
        the vanilla implementation and the React twin.
      </p>
      {[...sections].map(([section, examples]) => (
        <section key={section}>
          <h2 className="section-title">{section}</h2>
          <div className="card-grid">
            {examples.map((example) => (
              <a key={example.id} className="card" href={`#/example/${example.id}`}>
                <h3>{example.title}</h3>
                <p>{example.description}</p>
              </a>
            ))}
          </div>
        </section>
      ))}
    </>
  );
}

function ExamplePage({ example }: { readonly example: GalleryExample }): React.ReactElement {
  return (
    <>
      <p className="crumb">
        <a href="#/">← {example.section}</a>
      </p>
      <h1 className="example-title">{example.title}</h1>
      <p className="example-description">{example.description}</p>
      <div className="example-layout">
        <div className="demo-panel">
          <MemoDemo example={example} />
        </div>
        <CodePanel example={example} />
      </div>
    </>
  );
}

/** Minimal hash router: `#/` landing, `#/example/<id>` detail. */
function useHashRoute(): string {
  const [hash, setHash] = useState(window.location.hash);
  useEffect(() => {
    const onChange = (): void => setHash(window.location.hash);
    window.addEventListener("hashchange", onChange);
    return () => window.removeEventListener("hashchange", onChange);
  }, []);
  return hash;
}

function App(): React.ReactElement {
  const hash = useHashRoute();
  const match = /^#\/example\/(.+)$/.exec(hash);
  if (match === null) return <Landing />;
  const id = match[1];
  const example = EXAMPLES.find((candidate) => candidate.id === id);
  if (example === undefined) {
    return (
      <p className="intro">
        Unknown example <code>{id}</code>. <a href="#/">Back to the index</a>.
      </p>
    );
  }
  return <ExamplePage key={example.id} example={example} />;
}

createRoot(app).render(<App />);

// Light/dark toggle (T60). The button lives in the static header; the inline
// bootstrap script in index.html already set html[data-theme] before first
// paint, so this only wires the control and its label.
function setupThemeToggle(): void {
  const button = document.getElementById("theme-toggle");
  if (button === null) return;
  const sync = (): void => {
    const theme = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    button.textContent = theme === "light" ? "☀ Light" : "☾ Dark";
    button.setAttribute("aria-label", `Switch to ${theme === "light" ? "dark" : "light"} mode`);
  };
  button.addEventListener("click", () => {
    const next = document.documentElement.dataset.theme === "light" ? "dark" : "light";
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem("kf-gallery-theme", next);
    } catch {
      // Private-mode storage failures are cosmetic — the toggle still works.
    }
    sync();
  });
  sync();
}

setupThemeToggle();
