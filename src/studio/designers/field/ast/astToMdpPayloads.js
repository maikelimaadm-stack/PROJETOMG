/** Field AST → MDP registry payloads (field_config summary entry) */

export function astRootToMdpPayloads(ast) {
  const moduleId = ast.moduleId ?? ast.root?.attrs?.moduleId ?? "empresas";
  const entityId = ast.root?.attrs?.entityId ?? "EmpresaCadastro";
  const fieldNames = [];
  (ast.root?.children ?? []).forEach((group) => {
    (group.children ?? []).forEach((field) => {
      if (field.attrs?.fieldName) fieldNames.push(field.attrs.fieldName);
    });
  });

  return [
    {
      entryId: `${moduleId}.field_config.studio`,
      entryType: "field_config",
      moduleId,
      entityId,
      label: "Field Studio Config",
      payload: {
        engine: "V14",
        source: "field-studio",
        nativeFields: fieldNames,
        updatedAt: new Date().toISOString(),
      },
    },
  ];
}

export default astRootToMdpPayloads;
