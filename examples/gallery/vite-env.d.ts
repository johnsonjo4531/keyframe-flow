// Ambient types for Vite's raw-import suffix (source text of a file).
declare module "*?raw" {
  const content: string;
  export default content;
}
