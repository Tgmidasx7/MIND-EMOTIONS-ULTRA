import test from "node:test";
import assert from "node:assert/strict";
import { appUrl, parseAppUrl } from "../src/domain/routes.js";

test("tab URLs include the GitHub Pages project base and human-readable paths", () => {
  assert.equal(
    appUrl("emotions", 1, "/MIND-EMOTIONS-ULTRA/"),
    "/MIND-EMOTIONS-ULTRA/filhos/emocoes",
  );
  assert.equal(
    appUrl("insights", 1, "/MIND-EMOTIONS-ULTRA/"),
    "/MIND-EMOTIONS-ULTRA/graficos",
  );
  assert.equal(appUrl("home", 1, "/"), "/visao-geral");
});

test("routes restore the active tab and selected child from a shared URL", () => {
  assert.deepEqual(
    parseAppUrl(
      "/MIND-EMOTIONS-ULTRA/filhos/emocoes",
      "?filho=manuela",
      "/MIND-EMOTIONS-ULTRA/",
    ),
    { tab: "emotions", studentId: 3, version: "current" },
  );
  assert.deepEqual(
    parseAppUrl("/MIND-EMOTIONS-ULTRA/notas", "", "/MIND-EMOTIONS-ULTRA/"),
    { tab: "grades", studentId: 1, version: "current" },
  );
});

test("Att 1.1 is a separate route and preserves profile plus tab navigation", () => {
  assert.equal(
    appUrl("grades", 3, "/MIND-EMOTIONS-ULTRA/", "att1.1"),
    "/MIND-EMOTIONS-ULTRA/att1.1/notas?filho=manuela",
  );
  assert.deepEqual(
    parseAppUrl(
      "/MIND-EMOTIONS-ULTRA/att1.1/notas",
      "?filho=manuela",
      "/MIND-EMOTIONS-ULTRA/",
    ),
    { tab: "grades", studentId: 3, version: "att1.1" },
  );
});
