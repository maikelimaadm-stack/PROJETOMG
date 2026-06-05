export function formatCadastroRecordCount(total = 0) {
  const value = Math.max(0, Number(total) || 0);
  return `${value.toLocaleString("pt-BR")} registros`;
}
