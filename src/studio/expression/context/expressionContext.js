/** Expression evaluation context — variables, functions, scope (Program 2.3.2) */

export function createExpressionContext(partial = {}) {
  const variables = new Map(Object.entries(partial.variables ?? {}));
  const variableTypes = new Map(Object.entries(partial.variableTypes ?? {}));
  const propertyTypes = partial.propertyTypes ?? {};

  return Object.freeze({
    getVariable(name) {
      return variables.has(name) ? variables.get(name) : undefined;
    },
    setVariable(name, value, type = "unknown") {
      variables.set(name, value);
      variableTypes.set(name, type);
    },
    getVariableType(name) {
      return variableTypes.get(name) ?? "unknown";
    },
    getPropertyType(node) {
      const key = `${node.object?.name ?? "?"}.${node.property}`;
      return propertyTypes[key] ?? "unknown";
    },
    listVariables() {
      return [...variables.keys()];
    },
    toJSON() {
      return {
        variables: Object.fromEntries(variables),
        variableTypes: Object.fromEntries(variableTypes),
      };
    },
  });
}

export default createExpressionContext;
