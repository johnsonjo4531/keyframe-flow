import type { StorybookConfig } from "@storybook/react-vite";

/** Absolute filesystem path of this file's directory, computed without `node:`
 * imports or globals (the repo ships no Node type definitions; POSIX paths only). */
const storybookDir = import.meta.url.slice("file://".length).replace(/\/[^/]*$/, "");

const config: StorybookConfig = {
  stories: ["../stories/**/*.stories.tsx"],
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
      "keyframe-flow": `${storybookDir}/../../src/index.ts`,
    };
    return viteConfig;
  },
};

export default config;
