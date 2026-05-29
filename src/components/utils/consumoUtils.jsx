export const calcularDiasPeriodo = (dataInicio, dataFim) => {
  if (!dataInicio || !dataFim) return 0;
  const inicio = new Date(dataInicio);
  const fim = new Date(dataFim);
  return Math.max(0, Math.round((fim - inicio) / (1000 * 60 * 60 * 24)));
};

export const fecharPeriodoSupplementacao = async ({ evento, diasPeriodo, sobraInicial, sobraFinal }) => {
  // Stub - funcionalidade de suplementação removida
  return null;
};