import { FazendaApi } from "@/modules/fazendas/apis/FazendaApi";
import { fazendaSchema } from "@/modules/fazendas/config/fazendaSchema";

const fazendaRepository = {
  listPage(params = {}) {
    return FazendaApi.list(params);
  },

  async list(params = {}) {
    const result = await FazendaApi.list(params);
    return result.items || [];
  },

  get(id) {
    return FazendaApi.get(id);
  },

  create(data) {
    const payload = fazendaSchema.parse(data);
    return FazendaApi.create(payload);
  },

  update(id, data) {
    const payload = fazendaSchema.parse(data);
    return FazendaApi.update(id, payload);
  },

  delete(id) {
    return FazendaApi.remove(id);
  },

  listCamposPersonalizados(mode = "aplicavel") {
    return FazendaApi.listFields({ mode });
  },

  createCampoPersonalizado(data) {
    return FazendaApi.createField(data);
  },

  updateCampoPersonalizado(id, data) {
    return FazendaApi.updateField(id, data);
  },

  deleteCampoPersonalizado(campo) {
    return FazendaApi.removeField(campo.id || campo.field_id);
  },

  listOptionsSources(sources = []) {
    return FazendaApi.listOptions(sources);
  },
};

export default fazendaRepository;

