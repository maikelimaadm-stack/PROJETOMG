export const patchMetricsCache = (queryClient, delta = {}) => {
  queryClient.setQueriesData({ queryKey: ["metrics-contadores"] }, (previous) => {
    const base = previous || { empresas: 0, registrosGlobais: 0 };
    return {
      empresas: Math.max(0, Number(base.empresas || 0) + Number(delta.empresas || 0)),
      registrosGlobais: Math.max(
        0,
        Number(base.registrosGlobais || 0) + Number(delta.registrosGlobais || 0)
      ),
    };
  });
};

export const setMetricsCache = (queryClient, contadores) => {
  if (!contadores) return;
  queryClient.setQueryData(["metrics-contadores"], {
    empresas: Number(contadores.empresas || 0),
    registrosGlobais: Number(contadores.registrosGlobais || 0),
  });
};
