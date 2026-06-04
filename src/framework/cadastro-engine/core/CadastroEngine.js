import { getCadastroModule } from "./ModuleRegistry.js";
import { LayoutEngine } from "../layout/LayoutEngine.js";
import { LayoutPreferencesEngine } from "../preferences/LayoutPreferencesEngine.js";
import { FieldEngine } from "../field/FieldEngine.js";
import { CustomFieldEngine } from "../custom-field/CustomFieldEngine.js";
import { ValidationEngine } from "../validation/ValidationEngine.js";

/**
 * Fachada do motor de cadastro por módulo.
 */
export class CadastroEngine {
  /** @param {string} moduleId */
  constructor(moduleId) {
    this.config = getCadastroModule(moduleId);
    this.moduleId = moduleId;
    this.layout = new LayoutEngine(this.config);
    this.preferences = new LayoutPreferencesEngine(this.config);
    this.fields = FieldEngine;
    this.customFields = new CustomFieldEngine(this.config);
    this.validation = ValidationEngine;
  }

  static for(moduleId) {
    return new CadastroEngine(moduleId);
  }
}

export default CadastroEngine;
