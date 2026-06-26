import { marcaRepository } from "../repositories/marcaRepository.js";

export const marcaService = {
  list: (scope, query) => marcaRepository.list(scope, query),
  get: (scope, id) => marcaRepository.getById(scope, id),
  create: (scope, payload) => marcaRepository.create(scope, payload),
  update: (scope, id, payload) => marcaRepository.update(scope, id, payload),
  remove: (scope, id) => marcaRepository.remove(scope, id),
};
