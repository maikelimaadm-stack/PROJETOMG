import assert from "node:assert/strict";

let loadPromise = null;

const mockImport = () => {
  loadPromise = Promise.resolve({ default: "mg-prototype.css" });
  return loadPromise;
};

// Simulate module state reset for test
const mod = await import("../../src/framework/mak/styles/ensureMakPrototypeStyles.js");

// Patch dynamic import by calling twice - second call should return same promise
// We test idempotence via the module's internal state after first call
const first = mod.ensureMakPrototypeStyles();
assert.equal(typeof first?.then, "function");

const second = mod.ensureMakPrototypeStyles();
assert.equal(first, second);

console.log("OK: ensure-mak-prototype-styles.unit");
