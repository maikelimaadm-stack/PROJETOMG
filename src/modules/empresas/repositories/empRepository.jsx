import { EmpresaApi } from "@/apis/empresa/EmpresaApi";
import empLocalStore from "../storage/empLocalStore";
import empCamposLocalStore from "../storage/empCamposLocalStore";
import { buildAllTestRecords, buildValorForIndex, EMP_SEED_TARGET_COUNT } from "../config/empSeedData";
import {
  normalizeEmpresaRecord,
  reserveNextCodigoEmpresa,
  stripEmpresaPersistPayload,
  syncLastIssuedCodigo,
} from "../utils/empCodigoUtils";

const REMOTE_SEED_FLAG = "emp_remote_seeded_v2";

const checkRemoteApiAvailability = async () => EmpresaApi.isAvailable();

let remoteAvailablePromise = null;
const isRemoteAvailable = () => {
  if (!remoteAvailablePromise) remoteAvailablePromise = checkRemoteApiAvailability();
  return remoteAvailablePromise;
};

const seedRemoteIfEmpty = async () => {
  let records = await EmpresaApi.listEmpresas();
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
    const latest = await EmpresaApi.listEmpresas();
    syncLastIssuedCodigo(latest);
    const codigo = reserveNextCodigoEmpresa(latest);
    await EmpresaApi.createEmpresa({
      ...record,
      codigo_empresa: codigo,
      campos_personalizados: {
        ...(record.campos_personalizados || {}),
        valor: buildValorForIndex(codigo - 1)
      }
    });
  }

  localStorage.setItem(REMOTE_SEED_FLAG, 'v2');
  records = await EmpresaApi.listEmpresas();
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
        return await EmpresaApi.getEmpresa(id);
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
        const list = await EmpresaApi.listEmpresas();
        syncLastIssuedCodigo(list);
        const codigo = reserveNextCodigoEmpresa(list);
        const created = await EmpresaApi.createEmpresa({ ...payload, codigo_empresa: codigo });
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
        const updated = await EmpresaApi.updateEmpresa(id, payload);
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
        await EmpresaApi.deleteEmpresa(id);
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
        return await EmpresaApi.listCamposPersonalizados();
      } catch {
        return empCamposLocalStore.seedIfEmpty();
      }
    }
    return empCamposLocalStore.seedIfEmpty();
  },

  async createCampoPersonalizado(data) {
    if (await isRemoteAvailable()) {
      try {
        return await EmpresaApi.createCampoPersonalizado(data);
      } catch {
        return empCamposLocalStore.create(data);
      }
    }
    return empCamposLocalStore.create(data);
  },

  async updateCampoPersonalizado(id, data) {
    if (await isRemoteAvailable()) {
      try {
        return await EmpresaApi.updateCampoPersonalizado(id, data);
      } catch {
        return empCamposLocalStore.update(id, data);
      }
    }
    return empCamposLocalStore.update(id, data);
  },

  async deleteCampoPersonalizado(campo) {
    if (await isRemoteAvailable()) {
      try {
        return await EmpresaApi.deleteCampoPersonalizado(campo.id || campo.field_id);
      } catch {
        return empCamposLocalStore.delete(campo.id || campo.field_id);
      }
    }
    return empCamposLocalStore.delete(campo.id || campo.field_id);
  },

  async listOptionsSources(sources) {
    if (await isRemoteAvailable()) {
      try {
        return await EmpresaApi.listOptionsSources(sources);
      } catch {
        return {};
      }
    }
    return {};
  }
};

export default empRepository;
