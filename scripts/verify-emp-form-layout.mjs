import { buildEmpFormDefaultConfig } from "../src/modules/empresas/components/formEmp.constants.js";
import {
  countKnownLayoutFields,
  ensureLayoutFields,
} from "../src/framework/cadastro/layouts/empFormLayoutStore.js";
import { resolveFieldWidthToken } from "../src/framework/cadastro/layouts/empFormFieldSizing.js";

const defaults = buildEmpFormDefaultConfig();
const nativeIds = new Set(Object.values(defaults.layout).flat().filter(Boolean));

const corrupt = {
  panels: [
    { id: "principal", label: "Principal", hidden: false },
    { id: "geral", label: "Geral", hidden: true },
    { id: "endereco", label: "Endereço", hidden: true },
    { id: "observacoes", label: "Observações", hidden: true },
  ],
  layout: {
    principal: ["custom:deleted_field"],
    geral: [],
    endereco: [],
    observacoes: [],
  },
  fieldLayoutConfig: { mode: "vertical", columns: 1 },
};

const repaired = ensureLayoutFields(corrupt, defaults, { knownFieldIds: nativeIds });
const knownCount = countKnownLayoutFields(repaired.layout, nativeIds);
const hasRazaoSocial = repaired.layout.principal?.includes("razao_social");

if (!hasRazaoSocial || knownCount < 10) {
  console.error("Falha: layout reparado sem campos nativos essenciais.", {
    principal: repaired.layout.principal,
    knownCount,
  });
  process.exit(1);
}

const selectToken = resolveFieldWidthToken({ type: "select", name: "estado" });
if (selectToken !== "lookup") {
  console.error("Falha: resolveFieldWidthToken para select deveria retornar lookup.", selectToken);
  process.exit(1);
}

console.log("OK: layout corrompido reparado com razao_social no painel principal.");
console.log("OK: resolveFieldWidthToken sem erro em campos select.");
