import { base44 } from '@/api/base44Client';
import empLocalStore from './empLocalStore';
import { EMP_TEST_RECORDS } from './empSeedData';

const hasAppId = () => Boolean(import.meta.env.VITE_BASE44_APP_ID || import.meta.env.BASE44_APP_ID);
const REMOTE_SEED_FLAG = 'emp_remote_seeded_v1';

const useRemoteApi = async () => {
  if (!hasAppId()) return false;
  try {
    await base44.entities.EmpresaCadastro.list('-codigo_empresa', 1);
    return true;
  } catch {
    return false;
  }
};

let remoteAvailablePromise = null;
const isRemoteAvailable = () => {
  if (!remoteAvailablePromise) remoteAvailablePromise = useRemoteApi();
  return remoteAvailablePromise;
};

const seedRemoteIfEmpty = async () => {
  const records = await base44.entities.EmpresaCadastro.list('-codigo_empresa');
  if (records.length > 0) return records;
  if (localStorage.getItem(REMOTE_SEED_FLAG) === '1') return records;

  for (const record of EMP_TEST_RECORDS) {
    const all = await base44.entities.EmpresaCadastro.list('-codigo_empresa', 1);
    const maxCodigo = all.length > 0 ? (all[0].codigo_empresa || 0) : 0;
    await base44.entities.EmpresaCadastro.create({
      ...record,
      codigo_empresa: Number(maxCodigo) + 1
    });
  }

  localStorage.setItem(REMOTE_SEED_FLAG, '1');
  return base44.entities.EmpresaCadastro.list('-codigo_empresa');
};

const empRepository = {
  async list() {
    if (await isRemoteAvailable()) {
      try {
        return await seedRemoteIfEmpty();
      } catch {
        return empLocalStore.seedIfEmpty();
      }
    }
    return empLocalStore.seedIfEmpty();
  },

  async get(id) {
    if (await isRemoteAvailable()) {
      try {
        return base44.entities.EmpresaCadastro.filter({ id });
      } catch {
        return empLocalStore.filter({ id });
      }
    }
    return empLocalStore.filter({ id });
  },

  async create(data) {
    if (await isRemoteAvailable()) {
      try {
        const all = await base44.entities.EmpresaCadastro.list('-codigo_empresa', 1);
        const maxCodigo = all.length > 0 ? (all[0].codigo_empresa || 0) : 0;
        const codigo = Number(maxCodigo) + 1;
        return base44.entities.EmpresaCadastro.create({ ...data, codigo_empresa: codigo });
      } catch {
        return empLocalStore.create(data);
      }
    }
    return empLocalStore.create(data);
  },

  async update(id, data) {
    if (await isRemoteAvailable()) {
      try {
        return base44.entities.EmpresaCadastro.update(id, data);
      } catch {
        return empLocalStore.update(id, data);
      }
    }
    return empLocalStore.update(id, data);
  },

  async delete(id) {
    if (await isRemoteAvailable()) {
      try {
        return base44.entities.EmpresaCadastro.delete(id);
      } catch {
        return empLocalStore.delete(id);
      }
    }
    return empLocalStore.delete(id);
  },

  async listCamposPersonalizados() {
    if (await isRemoteAvailable()) {
      try {
        return base44.entities.CampoPersonalizadoEmpresa.list('ordem_tabela');
      } catch {
        return [];
      }
    }
    return [];
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
