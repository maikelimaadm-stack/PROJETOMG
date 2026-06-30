/** Field-specific binding kinds — registered on SOM Binding Engine */

export function registerFieldBindingKinds(bindingEngine) {
  ["entity", "field", "entry", "reference"].forEach((kind) => {
    bindingEngine.registerBindingKind({ kind, validate: () => [] });
  });
}

export default registerFieldBindingKinds;
