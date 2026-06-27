/** Utilitários de máscara numérica/texto — SSOT Foundation (V15). */

const onlyDigits = (value) => String(value || "").replace(/\D/g, "");

const applyNumberMask = (digits, mask) => {
  let index = 0;
  return String(mask || "")
    .replace(/#/g, () => digits[index++] || "")
    .replace(/[^0-9]+$/g, "");
};

const getBestMask = (digits, masks) =>
  masks.find((mask) => (mask.match(/#/g) || []).length >= digits.length) ||
  masks[masks.length - 1] ||
  "";

export const splitDateTimeValue = (value) => {
  if (!value) return { date: "", time: "" };
  const [datePart, timePart = ""] = String(value).replace(" ", "T").split("T");
  return { date: datePart || "", time: timePart.slice(0, 5) || "" };
};

export const formatMaskedNumber = (value, campo) => {
  const masks = String(campo?.mascaras_text || "")
    .split("\n")
    .map((item) => item.trim())
    .filter(Boolean)
    .sort((a, b) => (a.match(/#/g) || []).length - (b.match(/#/g) || []).length);
  const maxDigits = Math.max(...masks.map((mask) => (mask.match(/#/g) || []).length), 0);
  const digits = onlyDigits(value).slice(0, maxDigits || undefined);
  return applyNumberMask(digits, getBestMask(digits, masks));
};

export default { splitDateTimeValue, formatMaskedNumber };
