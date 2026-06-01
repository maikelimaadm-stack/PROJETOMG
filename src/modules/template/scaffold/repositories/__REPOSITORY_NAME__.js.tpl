import { __API_NAME__ } from "@/modules/__MODULE_ID__/apis/__API_NAME__";
import { __SCHEMA_NAME__ } from "@/modules/__MODULE_ID__/config/__SCHEMA_NAME__";

const __REPOSITORY_NAME__ = {
  listPage(params = {}) {
    return __API_NAME__.list(params);
  },

  async list(params = {}) {
    const result = await __API_NAME__.list(params);
    return result.items || [];
  },

  get(id) {
    return __API_NAME__.get(id);
  },

  create(data) {
    const payload = __SCHEMA_NAME__.parse(data);
    return __API_NAME__.create(payload);
  },

  update(id, data) {
    const payload = __SCHEMA_NAME__.parse(data);
    return __API_NAME__.update(id, payload);
  },

  delete(id) {
    return __API_NAME__.remove(id);
  },

  listCamposPersonalizados() {
    return __API_NAME__.listFields();
  },

  createCampoPersonalizado(data) {
    return __API_NAME__.createField(data);
  },

  updateCampoPersonalizado(id, data) {
    return __API_NAME__.updateField(id, data);
  },

  deleteCampoPersonalizado(campo) {
    return __API_NAME__.removeField(campo.id || campo.field_id);
  },
};

export default __REPOSITORY_NAME__;

