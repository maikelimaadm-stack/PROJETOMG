export const templateRepository = {
  listPage: async () => ({ items: [], total: 0, page: 1, pageSize: 50, totalPages: 1 }),
  list: async () => [],
  get: async () => null,
  create: async (payload) => payload,
  update: async (_id, payload) => payload,
  delete: async () => true,
};

export default templateRepository;

