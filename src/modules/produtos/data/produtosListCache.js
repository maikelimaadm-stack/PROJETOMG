export const PRODUTOS_LIST_QUERY_KEY = ["pro-cadastro"];

export function patchProdutosCache(queryClient, updater) {
  queryClient.setQueryData(PRODUTOS_LIST_QUERY_KEY, updater);
}
