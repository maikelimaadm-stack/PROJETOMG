/** Utilitários genéricos de pesquisa/cards — Foundation (sem acoplamento a módulos). */

export const MAK_SEARCH_DROPDOWN_MAX_FIELDS = 5;

export const MAK_CARDS_LAYOUT_DEFAULT = { cardsPerRow: 3 };

export const MAK_CARDS_LAYOUT_OPTIONS = [
  { value: 1, label: "1 card por linha", hint: "Até 5 campos por linha no card" },
  { value: 2, label: "2 cards por linha", hint: "Até 2 campos por linha no card" },
  { value: 3, label: "3 cards por linha", hint: "1 campo por linha no card" },
  { value: 4, label: "4 cards por linha", hint: "1 campo por linha no card" },
];

export const normalizeCardsPerRow = (value) => {
  const parsed = Number(value);
  if (parsed === 1 || parsed === 2 || parsed === 3 || parsed === 4) return parsed;
  return MAK_CARDS_LAYOUT_DEFAULT.cardsPerRow;
};

export const getFieldsPerRowForLayout = (cardsPerRow) => {
  if (cardsPerRow === 1) return 5;
  if (cardsPerRow === 2) return 2;
  return 1;
};

export const countSearchDropdownVisibleFields = (fields = []) =>
  fields.filter((field) => field.visible && !field.primary).length;

export const getDefaultCardVisFields = (catalog = []) => {
  if (!Array.isArray(catalog) || catalog.length === 0) return [];
  return catalog.map((field) => ({
    ...field,
    visible: field.primary ? true : Boolean(field.visible),
  }));
};

export const defaultGetSearchFieldValue = (record, key) => {
  if (!record) return "—";
  const value = record[key];
  if (value === undefined || value === null || value === "") return "—";
  return String(value);
};
