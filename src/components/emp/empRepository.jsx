import { base44 } from '@/api/base44Client';

const empRepository = {
  async list() {
    return base44.entities.EmpresaCadastro.list('-codigo_empresa');
  },

  async get(id) {
    return base44.entities.EmpresaCadastro.filter({ id });
  },

  async create(data) {
    const all = await base44.entities.EmpresaCadastro.list('-codigo_empresa', 1);
    const maxCodigo = all.length > 0 ? (all[0].codigo_empresa || 0) : 0;
    const codigo = Number(maxCodigo) + 1;
    return base44.entities.EmpresaCadastro.create({ ...data, codigo_empresa: codigo });
  },

  async update(id, data) {
    return base44.entities.EmpresaCadastro.update(id, data);
  },

  async delete(id) {
    return base44.entities.EmpresaCadastro.delete(id);
  },

  async listCamposPersonalizados() {
    return base44.entities.CampoPersonalizadoEmpresa.list('ordem_tabela');
  },

  async createCampoPersonalizado(data) {
    return base44.entities.CampoPersonalizadoEmpresa.create(data);
  },

  async updateCampoPersonalizado(id, data) {
    return base44.entities.CampoPersonalizadoEmpresa.update(id, data);
  },

  async deleteCampoPersonalizado(campo) {
    return base44.entities.CampoPersonalizadoEmpresa.delete(campo.id || campo.field_id);
  },

  async listOptionsSources(sources) {
    const result = {};
    await Promise.all((sources || []).map(async ({ entity, labelField, valueField }) => {
      try {
        const items = await base44.entities[entity]?.list?.() || [];
        result[entity] = items.map(item => ({
          id: item[valueField] || item.id,
          nome: item[labelField] || item.nome || item.name || ''
        }));
      } catch {
        result[entity] = [];
      }
    }));
    return result;
  }
};

export default empRepository;