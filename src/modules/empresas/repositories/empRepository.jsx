import { EmpresaApi } from "@/apis/empresa/EmpresaApi";
import { normalizeEmpresaRecord, stripEmpresaPersistPayload } from "../utils/empCodigoUtils";

const empRepository = {
  async listPage(params = {}) {
    return EmpresaApi.listEmpresas(params);
  },

  async list(params = {}) {
    const result = await EmpresaApi.listEmpresas(params);
    return result.items || [];
  },

  async get(id) {
    return EmpresaApi.getEmpresa(id);
  },

  async create(data) {
    const payload = stripEmpresaPersistPayload(data);
    const response = await EmpresaApi.createEmpresa(payload);
    return {
      item: normalizeEmpresaRecord(response?.item, payload),
      contadores: response?.contadores || null,
    };
  },

  async update(id, data) {
    const payload = stripEmpresaPersistPayload(data);
    const updated = await EmpresaApi.updateEmpresa(id, payload);
    return normalizeEmpresaRecord(updated, { id, ...payload });
  },

  async delete(id) {
    const response = await EmpresaApi.deleteEmpresa(id);
    return { ok: true, contadores: response?.contadores || null };
  },

  async listCamposPersonalizados(mode = "aplicavel") {
    return EmpresaApi.listCamposPersonalizados({ mode });
  },

  async listCamposPaginated(params = {}) {
    return EmpresaApi.listCamposPaginated(params);
  },

  async listEmpresasSelector(params = {}) {
    return EmpresaApi.listEmpresasSelector(params);
  },


  async listOptionsSources(sources) {
    return EmpresaApi.listOptionsSources(sources);
  }
};

export default empRepository;
