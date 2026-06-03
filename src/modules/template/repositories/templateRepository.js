import { TemplateApi } from "@/modules/template/apis/TemplateApi";
import { templateSchema } from "@/modules/template/config/templateSchema";
import repCps from "@/modules/cadcps/repositories/repCps";
import {
  legacyPayloadToCadcps,
  listCamposForLegacyDialog,
  toLegacyDialogCampo,
} from "@/modules/cadcps/adapters/legacyDialogAdapter";

export const templateRepository = {
  async listPage(params = {}) {
    try {
      return await TemplateApi.list(params);
    } catch {
      return { items: [], total: 0, page: 1, pageSize: 50, totalPages: 1 };
    }
  },
  async list(params = {}) {
    const result = await this.listPage(params);
    return result.items || [];
  },
  async get(id) {
    const payload = await TemplateApi.get(id);
    return payload?.item || null;
  },
  async create(payload) {
    const parsed = templateSchema.parse(payload);
    const response = await TemplateApi.create(parsed);
    return response?.item || response;
  },
  async update(id, payload) {
    const parsed = templateSchema.parse(payload);
    const response = await TemplateApi.update(id, parsed);
    return response?.item || response;
  },
  async delete(id) {
    await TemplateApi.remove(id);
    return true;
  },
  async listCamposPersonalizados() {
    return listCamposForLegacyDialog();
  },
  async createCampoPersonalizado(data) {
    const payload = await legacyPayloadToCadcps(data);
    const created = await repCps.create(payload);
    return toLegacyDialogCampo(created);
  },
  async updateCampoPersonalizado(id, data) {
    const payload = await legacyPayloadToCadcps(data);
    const updated = await repCps.update(id, payload);
    return toLegacyDialogCampo(updated);
  },
  async deleteCampoPersonalizado(campo) {
    await repCps.remove(campo.id || campo.field_id);
    return true;
  },
};

export default templateRepository;
