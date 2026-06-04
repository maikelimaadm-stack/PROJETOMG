import { FieldEngine } from "../field/FieldEngine.js";
import { cadastroFieldsApi } from "../api/cadastroFieldsApi.js";

export class CustomFieldEngine {
  /** @param {import('../core/CadastroModuleConfig.js').CadastroModuleConfig} config */
  constructor(config) {
    this.config = config;
  }

  async list(mode = "aplicavel") {
    if (this.config.customFieldProvider) {
      return this.config.customFieldProvider(mode);
    }
    return cadastroFieldsApi.listCampos(this.config.entityName, { mode });
  }

  normalize(campo) {
    return FieldEngine.normalize({
      ...campo,
      origem: campo.origem || "customizado",
      customField: campo.customField || campo.field_name,
    });
  }

  normalizeList(campos = []) {
    return campos.map((c) => this.normalize(c));
  }

  getCustomKey(campo) {
    return campo?.customField || campo?.field_name || String(campo?.id || "").replace("custom:", "");
  }

  isCustomField(field) {
    return (
      field?.origem === "customizado" ||
      field?.customField ||
      String(field?.id || "").startsWith("custom:")
    );
  }
}

export default CustomFieldEngine;
