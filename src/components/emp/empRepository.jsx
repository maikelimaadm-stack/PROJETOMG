import { base44 } from '@/api/base44Client';

async function gerarCodigo() {
  try {
    const lista = await base44.entities.EmpresaCadastro.list('-codigo_empresa', 1);
    const ultimo = lista?.[0]?.codigo_empresa;
    return ultimo ? Number(ultimo) + 1 : 1;
  } catch {
    return Date.now();
  }
}

const empRepository = {
  async list() {
    return base44.entities.EmpresaCadastro.list('-codigo_empresa');
  },

  async get(id) {
    return base44.entities.EmpresaCadastro.filter({ id });
  },

  async create(data) {
    const codigo = await gerarCodigo();
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
};

export default empRepository;