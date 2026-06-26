import { produtoRepository } from "../repositories/produtoRepository.js";

export const produtoService = {
  list: (scope, query) => produtoRepository.list(scope, query),
  get: (scope, id) => produtoRepository.getById(scope, id),
  create: (scope, payload) => produtoRepository.create(scope, payload),
  update: (scope, id, payload) => produtoRepository.update(scope, id, payload),
  remove: (scope, id) => produtoRepository.remove(scope, id),
};
