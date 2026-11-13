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
  assert.match(imports, /@import "\.\/type-contrast\.css";/);
  assert.match(imports.trimEnd(), /@import "\.\/att11\.css";$/);
  assert.doesNotMatch(typeStyles, /\bzoom\s*:/i);
});

test("Att 1.1 has an isolated theme-token layer, responsive breakpoints and focus", () => {
  const att11 = readFileSync(
    new URL("../src/styles/att11.css", import.meta.url),
    "utf8",
  );
  assert.match(att11, /body\[data-version="att1\.1"\]/);
  assert.match(att11, /--att-surface: var\(--card\)/);
  assert.match(att11, /@media \(max-width: 380px\)/);
  assert.match(att11, /@media \(min-width: 1440px\)/);
  assert.match(att11, /:focus-visible/);
  assert.match(att11, /prefers-reduced-motion/);
  assert.match(att11, /\.topbar \.theme-corner-wrapper \{\s*order: 4/);
  assert.match(
    att11,
    /\.theme-circle-trigger \{[\s\S]*?background: var\(--att-surface\)/,
  );
  assert.match(
    att11,
    /\.theme-circle-trigger \{[\s\S]*?color: var\(--att-text\)/,
  );
  assert.match(
    att11,
    /profile-person h2[\s\S]*?color: var\(--att-text\) !important/,
  );
  assert.doesNotMatch(att11, /\bzoom\s*:/i);
});

test("Att 1.1 uses name-first student identity and larger desktop typography", () => {
  const app = readFileSync(new URL("../src/main.jsx", import.meta.url), "utf8");
  const att11 = readFileSync(
    new URL("../src/styles/att11.css", import.meta.url),
    "utf8",
  );
  assert.doesNotMatch(app, /s\.emoji|student\.emoji/);
  assert.match(att11, /@media \(min-width: 768px\)/);
  assert.match(att11, /student-chip b \{\s*font-size: 16px/);
  assert.match(att11, /profile-person h2 \{\s*font-size: clamp\(23px/);
  assert.match(att11, /grid-template-columns: minmax\(0, 1fr\) 82px 82px/);
});
