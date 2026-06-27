/** Agrupamento certificado — desabilitado intencionalmente no ModeloBase1. */
export const MAK_GROUPING_STATUS = Object.freeze({
  DISABLED: "disabled_certified",
});

export const MAK_GROUPING_REASON =
  "Agrupamento de colunas foi removido da tabela certificada ModeloBase1. Pivot/agrupamento exige Capability Pack.";

export function createMakGroupingEngine() {
  return Object.freeze({
    status: MAK_GROUPING_STATUS.DISABLED,
    isEnabled: () => false,
    reason: MAK_GROUPING_REASON,
    resolveGroupBy: () => [],
  });
}

export default createMakGroupingEngine;
