import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const styles = readFileSync(
  new URL("../src/styles/theme-readability.css", import.meta.url),
  "utf8",
);
const typeStyles = readFileSync(
  new URL("../src/styles/type-contrast.css", import.meta.url),
  "utf8",
);
const imports = readFileSync(
  new URL("../src/styles/index.css", import.meta.url),
  "utf8",
);

test("light and rose grade rows use readable theme surfaces and ink", () => {
  assert.match(styles, /body\[data-theme="light"\] \.content \.subject/);
  assert.match(styles, /body\[data-theme="rose"\] \.content \.subject/);
  assert.match(styles, /background-color: var\(--card2\) !important/);
  assert.match(styles, /\.subject > span[\s\S]*?color: var\(--ink\)/);
  assert.match(
    styles,
    /\.subject > small[\s\S]*?color: var\(--muted\) !important/,
  );
});

test("moderate typography and visible keyboard focus styles are loaded last", () => {
  assert.match(
    typeStyles,
    /\.welcome-row h1[\s\S]*?font-size: clamp\(24px, 2vw, 28px\)/,
  );
  assert.match(
    typeStyles,
    /:focus-visible[\s\S]*?outline: 2px solid var\(--accent\)/,
  );
  assert.match(imports.trimEnd(), /@import "\.\/type-contrast\.css";$/);
  assert.doesNotMatch(typeStyles, /\bzoom\s*:/i);
});
