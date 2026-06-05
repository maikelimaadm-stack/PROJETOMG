export const formatIdGlobal = (value) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) return "";
  return parsed.toLocaleString("pt-BR");
};
