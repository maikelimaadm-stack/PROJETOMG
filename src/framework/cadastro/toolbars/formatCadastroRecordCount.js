export function formatCadastroRecordPosition(currentIndex = 0, total = 0) {
  const safeTotal = Math.max(0, Number(total) || 0);
  if (safeTotal <= 0) return "0/0";
  const position = Math.min(Math.max(Number(currentIndex) + 1, 1), safeTotal);
  return `${position}/${safeTotal}`;
}
