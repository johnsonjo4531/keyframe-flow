import { defineConfig } from "vite-plus";

/** Absolute filesystem path of the repo root, computed without `node:` imports
 * or globals (the repo ships no Node type definitions; POSIX paths only). */
const repoRoot = import.meta.url.slice("file://".length).replace(/\/[^/]*$/, "");

// Standalone vanilla-TypeScript examples gallery (T56), built to
// site/examples/ and served at /keyframe-flow/examples/. The example modules
// themselves (examples/vanilla/) import nothing React-related; the React shell
// around them lives in examples/gallery/ and is just a mount host.
export default defineConfig({
  // The gallery is its own little app — examples/gallery/ is the Vite root so
  // its index.html (not the repo-root playground) is the build entry.
  root: "examples/gallery",
  base: "/keyframe-flow/examples/",
  build: {
    outDir: "../../site/examples",
    emptyOutDir: true,
  },
  resolve: {
    // Same alias as Storybook so the gallery exercises the working tree.
    alias: {
      "keyframe-flow": `${repoRoot}/src/index.ts`,
    },
  },
});
