import type { StorybookConfig } from "@storybook/react-vite";

/** Absolute filesystem path of this file's directory, computed without `node:`
 * imports or globals (the repo ships no Node type definitions; POSIX paths only). */
const storybookDir = import.meta.url.slice("file://".length).replace(/\/[^/]*$/, "");

/**
 * Vite plugin injecting each story module's verbatim source as
 * `meta.parameters.docs.source.originalSource`, so the Code panel shows the
 * real example code. The auto-generated `<Component {...args}/>` snippet is
 * useless in production builds, where component names are minified away.
 */
function injectStorySourcePlugin() {
  return {
    name: "keyframe-flow-story-source",
    // Run before esbuild/JSX transforms so readers see the authored TSX, not compiled `_jsx` calls.
    enforce: "pre" as const,
    transform(code: string, id: string): { code: string; map: null } | null {
      if (!id.endsWith(".stories.tsx") || !code.includes("export default meta;")) {
        return null;
      }
      const originalSource = JSON.stringify(`${code.trimEnd()}\n`);
      // Plain JS (this runs before esbuild strips the module's types): every
      // story file ends its CSF header with `export default meta;`.
      const injection = [
        "\nif (typeof meta === 'object' && meta !== null) {",
        "  meta.parameters = Object.assign({}, meta.parameters, {",
        "    docs: Object.assign({}, meta.parameters && meta.parameters.docs, {",
        "      source: Object.assign(",
        "        {},",
        "        meta.parameters && meta.parameters.docs && meta.parameters.docs.source,",
        // `source.code` is the Code panel's highest-precedence source, so it
        // wins over the auto-generated (minified) dynamic snippet.
        `        { code: ${originalSource}, originalSource: ${originalSource} },`,
        "      ),",
        "    }),",
        "  });",
        "}\n",
      ].join("\n");
      return { code: code + injection, map: null };
    },
  };
}

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.tsx"],
  addons: ["@storybook/addon-docs"],
  framework: {
    name: "@storybook/react-vite",
    options: {},
  },
  typescript: {
    // Stories are plain TSX; docgen is unnecessary for hand-written examples.
    reactDocgen: false,
  },
  async viteFinal(viteConfig) {
    // Resolve the library under development straight from its TypeScript
    // sources — stories always exercise the working tree, never a build.
    viteConfig.resolve = viteConfig.resolve ?? {};
    viteConfig.resolve.alias = {
      ...(viteConfig.resolve.alias as Record<string, string>),
      // Storybook rewrites plugin paths relative to its Vite root (examples/),
      // so hand it an absolute path computed from this file's real location.
      // The `react` subpath must precede the bare specifier: aliases match by
      // prefix, and "keyframe-flow" would otherwise swallow "keyframe-flow/react".
      "keyframe-flow/react": `${storybookDir}/../../src/react/index.ts`,
      "keyframe-flow": `${storybookDir}/../../src/index.ts`,
    };
    viteConfig.plugins = [...(viteConfig.plugins ?? []), injectStorySourcePlugin()];
    return viteConfig;
  },
};

export default config;
