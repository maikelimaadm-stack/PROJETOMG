import { TemplateApi } from "@/modules/template/apis/TemplateApi";
import { templateSchema } from "@/modules/template/config/templateSchema";

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
    const payload = await TemplateApi.listFields();
    return payload?.items || [];
  },
  async createCampoPersonalizado(data) {
    const payload = await TemplateApi.createField(data);
    return payload?.item || payload;
  },
  async updateCampoPersonalizado(id, data) {
    const payload = await TemplateApi.updateField(id, data);
    return payload?.item || payload;
  },
  async deleteCampoPersonalizado(campo) {
    await TemplateApi.removeField(campo.id || campo.field_id);
    return true;
  },
};

export default templateRepository;

