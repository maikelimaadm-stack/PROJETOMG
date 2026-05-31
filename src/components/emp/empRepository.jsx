import { base44 } from '@/api/base44Client';
import empLocalStore from './empLocalStore';
import empCamposLocalStore from './empCamposLocalStore';
import { buildAllTestRecords, buildValorForIndex, EMP_SEED_TARGET_COUNT } from './empSeedData';
import { normalizeEmpresaRecord, reserveNextCodigoEmpresa, stripEmpresaPersistPayload, syncLastIssuedCodigo } from './empCodigoUtils';

const hasAppId = () => Boolean(import.meta.env.VITE_BASE44_APP_ID || import.meta.env.BASE44_APP_ID);
const REMOTE_SEED_FLAG = 'emp_remote_seeded_v2';

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
  let records = await base44.entities.EmpresaCadastro.list('-codigo_empresa');
  const seedVersion = localStorage.getItem(REMOTE_SEED_FLAG);

  if (seedVersion === 'v2') {
    return records;
  }

  if (records.length >= EMP_SEED_TARGET_COUNT) {
    localStorage.setItem(REMOTE_SEED_FLAG, 'v2');
    return records;
  }

  const templates = buildAllTestRecords();
  const startAt = records.length;
  const toCreate = templates.slice(startAt, EMP_SEED_TARGET_COUNT);

  for (const record of toCreate) {
    const latest = await base44.entities.EmpresaCadastro.list('-codigo_empresa');
    syncLastIssuedCodigo(latest);
    const codigo = reserveNextCodigoEmpresa(latest);
    await base44.entities.EmpresaCadastro.create({
      ...record,
      codigo_empresa: codigo,
      campos_personalizados: {
        ...(record.campos_personalizados || {}),
        valor: buildValorForIndex(codigo - 1)
      }
    });
  }

  localStorage.setItem(REMOTE_SEED_FLAG, 'v2');
  records = await base44.entities.EmpresaCadastro.list('-codigo_empresa');
  syncLastIssuedCodigo(records);
  return records;
};

const empRepository = {
  async list() {
    let records;
    if (await isRemoteAvailable()) {
      try {
        records = await seedRemoteIfEmpty();
      } catch {
        records = empLocalStore.seedIfEmpty();
      }
    } else {
      records = empLocalStore.seedIfEmpty();
    }
    syncLastIssuedCodigo(records);
    return records;
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
    const payload = stripEmpresaPersistPayload(data);

    if (await isRemoteAvailable()) {
      try {
        const list = await base44.entities.EmpresaCadastro.list('-codigo_empresa');
        syncLastIssuedCodigo(list);
        const codigo = reserveNextCodigoEmpresa(list);
        const created = await base44.entities.EmpresaCadastro.create({ ...payload, codigo_empresa: codigo });
        return normalizeEmpresaRecord(created, { ...payload, codigo_empresa: codigo });
      } catch {
        return empLocalStore.create(payload);
      }
    }
    return empLocalStore.create(payload);
  },

  async update(id, data) {
    const payload = stripEmpresaPersistPayload(data);

    if (await isRemoteAvailable()) {
      try {
        const updated = await base44.entities.EmpresaCadastro.update(id, payload);
        return normalizeEmpresaRecord(updated, { id, ...payload });
      } catch {
        return empLocalStore.update(id, payload);
      }
    }
    return empLocalStore.update(id, payload);
  },

  async delete(id) {
    if (await isRemoteAvailable()) {
      try {
        await base44.entities.EmpresaCadastro.delete(id);
        empLocalStore.delete(id);
        return true;
      } catch (error) {
        if (empLocalStore.delete(id)) return true;
        throw error;
      }
    }

    if (!empLocalStore.delete(id)) {
      throw new Error("Registro não encontrado");
    }
    return true;
  },

  async listCamposPersonalizados() {
    if (await isRemoteAvailable()) {
      try {
        return base44.entities.CampoPersonalizadoEmpresa.list('ordem_tabela');
      } catch {
        return empCamposLocalStore.seedIfEmpty();
      }
    }
    return empCamposLocalStore.seedIfEmpty();
  },

  async createCampoPersonalizado(data) {
    if (await isRemoteAvailable()) {
      try {
        return base44.entities.CampoPersonalizadoEmpresa.create(data);
      } catch {
        return empCamposLocalStore.create(data);
      }
    }
    return empCamposLocalStore.create(data);
  },

  async updateCampoPersonalizado(id, data) {
    if (await isRemoteAvailable()) {
      try {
        return base44.entities.CampoPersonalizadoEmpresa.update(id, data);
      } catch {
        return empCamposLocalStore.update(id, data);
      }
    }
    return empCamposLocalStore.update(id, data);
  },

  async deleteCampoPersonalizado(campo) {
    if (await isRemoteAvailable()) {
      try {
        return base44.entities.CampoPersonalizadoEmpresa.delete(campo.id || campo.field_id);
      } catch {
        return empCamposLocalStore.delete(campo.id || campo.field_id);
      }
    }
    return empCamposLocalStore.delete(campo.id || campo.field_id);
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
