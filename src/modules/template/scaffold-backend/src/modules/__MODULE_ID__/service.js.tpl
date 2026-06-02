import { __MODULE_ID__Repository } from "./repository.js";

export const __MODULE_ID__Service = {
  list({ scope, query }) {
    return __MODULE_ID__Repository.list({ scope, query });
  },

  getById({ scope, id }) {
    return __MODULE_ID__Repository.getById({ scope, id });
  },

  create({ scope, payload }) {
    return __MODULE_ID__Repository.create({ scope, payload });
  },

  update({ scope, id, payload }) {
    return __MODULE_ID__Repository.update({ scope, id, payload });
  },

  remove({ scope, id }) {
    return __MODULE_ID__Repository.remove({ scope, id });
  },

  listFields({ scope }) {
    return __MODULE_ID__Repository.listFields({ scope });
  },

  createField({ scope, payload }) {
    return __MODULE_ID__Repository.createField({ scope, payload });
  },

  updateField({ scope, id, payload }) {
    return __MODULE_ID__Repository.updateField({ scope, id, payload });
  },

  removeField({ scope, id }) {
    return __MODULE_ID__Repository.removeField({ scope, id });
  },

  listOptions({ scope, sources = [] }) {
    return __MODULE_ID__Repository.listOptions({ scope, sources });
  },
};

