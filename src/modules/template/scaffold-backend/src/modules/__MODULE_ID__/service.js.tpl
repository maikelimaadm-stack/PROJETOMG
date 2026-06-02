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
};

