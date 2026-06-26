import assert from "node:assert/strict";
import {
  assertMakModuleConfig,
  isMakModuleConfig,
  resolveMakModuleLabels,
} from "../../src/framework/mak/module/MakModuleConfig.js";
import { empresasModuleDefinition } from "../../src/modules/empresas/config/moduleDefinition.js";
import {
  clearMakEventListeners,
  emitMakEvent,
  subscribeMakEvent,
} from "../../src/framework/mak/events/makEventBus.js";

assert.equal(isMakModuleConfig(empresasModuleDefinition), true);
assertMakModuleConfig(empresasModuleDefinition);

const labels = resolveMakModuleLabels(empresasModuleDefinition);
assert.equal(labels.moduleId, "empresas");
assert.equal(labels.plural, "Empresas");

let received = null;
const unsubscribe = subscribeMakEvent("mak:test", (payload) => {
  received = payload;
});
emitMakEvent("mak:test", { ok: true });
assert.deepEqual(received, { ok: true });
unsubscribe();
emitMakEvent("mak:test", { ok: false });
assert.deepEqual(received, { ok: true });

clearMakEventListeners();

assert.throws(() => assertMakModuleConfig({}), TypeError);

console.log("OK: mak-module-contract.unit");
