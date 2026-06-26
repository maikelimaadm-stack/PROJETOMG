import assert from "node:assert/strict";
import { ensureMakPrototypeStyles } from "../../src/framework/mak/styles/ensureMakPrototypeStyles.js";

assert.equal(typeof ensureMakPrototypeStyles, "function");

console.log("OK: ensure-mak-prototype-styles.unit");
