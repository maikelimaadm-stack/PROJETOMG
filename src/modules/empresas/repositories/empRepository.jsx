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
    const created = await EmpresaApi.createEmpresa(payload);
    return normalizeEmpresaRecord(created, payload);
  },

  async update(id, data) {
    const payload = stripEmpresaPersistPayload(data);
    const updated = await EmpresaApi.updateEmpresa(id, payload);
    return normalizeEmpresaRecord(updated, { id, ...payload });
  },

  async delete(id) {
    return EmpresaApi.deleteEmpresa(id);
  },

  async listCamposPersonalizados(mode = "aplicavel") {
    return EmpresaApi.listCamposPersonalizados({ mode });
  },


  async listOptionsSources(sources) {
    return EmpresaApi.listOptionsSources(sources);
  }
};

export default empRepository;
