import { matrix, transform } from "../src/index.ts";

// Minimal smoke demo of the Milestone 1 foundations. Full behavior lives in
// the test suite; this page just proves the core runs in a browser bundle.
const fluent = transform()
  .translate(100, 50, 0)
  .rotateY(Math.PI / 2)
  .scale(2);

const declarative = transform({
  position: [100, 50, 0],
  rotation: [0, Math.PI / 2, 0],
  scale: [2, 2, 2],
});

const m = fluent.toMatrix();
const native = m.toDOMMatrix();

const lines = [
  `fluent position:      ${JSON.stringify(fluent.components.position.toArray())}`,
  `declarative equals:   ${declarative.equals(fluent)}`,
  `matrix column-major:  ${m.toArray().join(", ")}`,
  `DOMMatrix is2D:       ${native.is2D}`,
  `inverted round-trip:  ${m.multiply(m.invert()).equals(matrix.identity())}`,
];

document.querySelector("#output")!.textContent = lines.join("\n");
