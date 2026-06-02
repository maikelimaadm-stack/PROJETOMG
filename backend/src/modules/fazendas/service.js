import { fazendasRepository } from "./repository.js";

export const fazendasService = {
  list({ scope, query }) {
    return fazendasRepository.list({ scope, query });
  },

  getById({ scope, id }) {
    return fazendasRepository.getById({ scope, id });
  },

  create({ scope, payload }) {
    return fazendasRepository.create({ scope, payload });
  },

  update({ scope, id, payload }) {
    return fazendasRepository.update({ scope, id, payload });
  },

  remove({ scope, id }) {
    return fazendasRepository.remove({ scope, id });
  },

  listFields({ scope, mode = "aplicavel" }) {
    return fazendasRepository.listFields({ scope, mode });
  },

  createField({ scope, payload }) {
    return fazendasRepository.createField({ scope, payload });
  },

  updateField({ scope, id, payload }) {
    return fazendasRepository.updateField({ scope, id, payload });
  },

  removeField({ scope, id }) {
    return fazendasRepository.removeField({ scope, id });
  },

  listOptions({ scope, sources = [] }) {
    return fazendasRepository.listOptions({ scope, sources });
  },
};

