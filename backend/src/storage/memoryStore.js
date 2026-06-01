const state = {
  empresas: [],
  campos: [],
  anexos: [],
};

const genId = (prefix) => `${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;

export const memoryStore = {
  listEmpresas() {
    return [...state.empresas];
  },
  getEmpresa(id) {
    return state.empresas.find((item) => item.id === id) || null;
  },
  createEmpresa(data) {
    const item = { id: genId("emp"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
    state.empresas.push(item);
    return item;
  },
  updateEmpresa(id, data) {
    const index = state.empresas.findIndex((item) => item.id === id);
    if (index === -1) return null;
    state.empresas[index] = { ...state.empresas[index], ...data, updatedAt: new Date().toISOString() };
    return state.empresas[index];
  },
  deleteEmpresa(id) {
    const index = state.empresas.findIndex((item) => item.id === id);
    if (index === -1) return false;
    state.empresas.splice(index, 1);
    return true;
  },
  listCampos() {
    return [...state.campos].sort((a, b) => (a.ordem_tabela || 0) - (b.ordem_tabela || 0));
  },
  createCampo(data) {
    const item = { id: genId("campo"), createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...data };
    state.campos.push(item);
    return item;
  },
  updateCampo(id, data) {
    const index = state.campos.findIndex((item) => item.id === id);
    if (index === -1) return null;
    state.campos[index] = { ...state.campos[index], ...data, updatedAt: new Date().toISOString() };
    return state.campos[index];
  },
  deleteCampo(id) {
    const index = state.campos.findIndex((item) => item.id === id);
    if (index === -1) return false;
    state.campos.splice(index, 1);
    return true;
  },
  listAnexos({ entityName, recordId }) {
    return state.anexos.filter((item) => {
      const matchEntity = entityName ? item.entity_name === entityName : true;
      const matchRecord = recordId ? item.record_id === recordId : true;
      return matchEntity && matchRecord;
    });
  },
  createAnexo(data) {
    const item = { id: genId("anexo"), createdAt: new Date().toISOString(), ...data };
    state.anexos.push(item);
    return item;
  },
  deleteAnexo(id) {
    const index = state.anexos.findIndex((item) => item.id === id);
    if (index === -1) return false;
    state.anexos.splice(index, 1);
    return true;
  },
};
