import assert from "node:assert/strict";
import {
  MAK_HISTORY_PLACEHOLDER_MESSAGE,
  MAK_PRINT_PLACEHOLDER_MESSAGE,
  createMakHistoryPlaceholder,
  createMakPrintPlaceholder,
} from "../../src/framework/mak/ux/makPlaceholderActions.js";

let printCalled = false;
let historyCalled = false;

const customPrint = () => {
  printCalled = true;
};
const customHistory = () => {
  historyCalled = true;
};

assert.equal(createMakPrintPlaceholder(customPrint), customPrint);
assert.equal(createMakHistoryPlaceholder(customHistory), customHistory);

createMakPrintPlaceholder(customPrint)();
createMakHistoryPlaceholder(customHistory)();
assert.equal(printCalled, true);
assert.equal(historyCalled, true);

assert.equal(typeof createMakPrintPlaceholder(undefined), "function");
assert.equal(typeof createMakHistoryPlaceholder(null), "function");
assert.equal(MAK_PRINT_PLACEHOLDER_MESSAGE.length > 10, true);
assert.equal(MAK_HISTORY_PLACEHOLDER_MESSAGE.length > 10, true);

console.log("OK: mak-placeholder-actions.unit");
