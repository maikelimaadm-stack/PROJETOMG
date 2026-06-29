/** Layout-specific binding kinds — registered on SOM Binding Engine */

export function registerLayoutBindingKinds(bindingEngine) {
  ["field", "expression", "relationship", "formula", "dataset", "api", "ai", "entry", "reference"].forEach(
    (kind) => {
      bindingEngine.registerBindingKind({
        kind,
        validate: (binding) => {
          if (
            !binding.targetId &&
            !["expression", "formula", "entry", "reference"].includes(kind)
          ) {
            return [`Binding ${kind} requires targetId.`];
          }
          return [];
        },
      });
    }
  );
}

export default registerLayoutBindingKinds;
