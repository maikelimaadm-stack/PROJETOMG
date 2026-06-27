import { listFieldTypes } from "@/framework/cadastro-engine/field/FieldRegistry.js";
import { ensureBuiltinFieldTypes } from "@/framework/cadastro-engine/field/registerBuiltinFieldTypes.js";

/**
 * Inventário estático dos componentes da Field Engine promovida do Cadastro de Empresas.
 */
export const MAK_FIELD_ENGINE_INVENTORY = Object.freeze({
  core: {
    FieldEngine: "src/framework/cadastro-engine/field/FieldEngine.js → campoEngine.jsx",
    FieldRegistry: "src/framework/cadastro-engine/field/FieldRegistry.js",
    registerBuiltinFieldTypes: "src/framework/cadastro-engine/field/registerBuiltinFieldTypes.js",
    CustomFieldEngine: "src/framework/cadastro-engine/custom-field/CustomFieldEngine.js",
    RenderEngine: "src/framework/cadastro-engine/render/RenderEngine.jsx → EmpDynamicFormRenderer.jsx",
    useCustomFieldRenderer: "src/framework/cadastro-engine/custom-field/CustomFieldRenderer.jsx",
  },
  renderers: {
    native: "EmpDynamicFormRenderer.jsx (DefaultControl)",
    custom: "CustomFieldRenderer.jsx (CADCPS)",
    declarative: "buildMakStandardDynamicFields.jsx / buildMakDynamicFieldsFromMetadata.js",
  },
  designSystem: {
    CadAutocomplete: "cadastro-engine/design-system/CadAutocomplete.jsx → EmpAutocomplete",
    CadFormDateControl: "CadFormDateControl.jsx → EmpFormDateControl",
    CadFormImageField: "CadFormImageField.jsx → EmpFormImageField",
    CadOptionListControl: "CadOptionListControl.jsx",
    CadToggle: "CadToggle.jsx",
  },
  makLayout: {
    MgCmdSelect: "framework/mak/layout/MgCmdSelect",
    MgDatePicker: "framework/mak/layout/MgDatePicker",
    MgTimePicker: "framework/mak/layout/MgTimePicker",
    MgLookup: "framework/mak/layout/MgLookup",
  },
  configurators: {
    EmpMaskConfig: "framework/cadastro/fields/EmpMaskConfig.jsx",
    EmpDecimalConfig: "framework/cadastro/fields/EmpDecimalConfig.jsx",
    EmpManualOptionsConfig: "framework/cadastro/fields/EmpManualOptionsConfig.jsx",
    EmpRelationConfig: "framework/cadastro/fields/EmpRelationConfig.jsx",
    EmpCalculationBuilder: "framework/cadastro/fields/EmpCalculationBuilder.jsx",
  },
});

/** Retorna tipos canônicos registrados na FieldRegistry. */
export function listMakFieldEngineTypes() {
  ensureBuiltinFieldTypes();
  return listFieldTypes();
}

export default MAK_FIELD_ENGINE_INVENTORY;
