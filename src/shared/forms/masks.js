const digitsOnly = (v) => String(v ?? "").replace(/\D/g, "");

/** @param {string} value */
export function maskCpf(value) {
  const d = digitsOnly(value).slice(0, 11);
  return d
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
}

/** @param {string} value */
export function maskCnpj(value) {
  const d = digitsOnly(value).slice(0, 14);
  return d
    .replace(/(\d{2})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1/$2")
    .replace(/(\d{4})(\d{1,2})$/, "$1-$2");
}

/** @param {string} value */
export function maskCep(value) {
  const d = digitsOnly(value).slice(0, 8);
  return d.replace(/(\d{5})(\d{1,3})$/, "$1-$2");
}

/** @param {string} value */
export function maskPhone(value) {
  const d = digitsOnly(value).slice(0, 11);
  if (d.length <= 10) {
    return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{4})(\d{1,4})$/, "$1-$2");
  }
  return d.replace(/(\d{2})(\d)/, "($1) $2").replace(/(\d{5})(\d{1,4})$/, "$1-$2");
}

const MASK_HANDLERS = {
  cpf: maskCpf,
  cnpj: maskCnpj,
  cep: maskCep,
  telefone: maskPhone,
  phone: maskPhone,
};

/**
 * @param {string} maskType
 * @param {string} value
 */
export function applyMask(maskType, value) {
  const fn = MASK_HANDLERS[String(maskType || "").toLowerCase()];
  return fn ? fn(value) : value;
}
