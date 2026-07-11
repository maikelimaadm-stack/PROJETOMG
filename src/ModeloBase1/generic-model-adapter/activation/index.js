/**
 * Barrel for the EMPRESAS/CADCPS GENERIC KERNEL CONSUMPTION layer.
 *
 * This layer lets the ModeloBase1 beta flow for Empresas and cadcps optionally
 * consume the pure generic-model kernel (through the ModeloBase1 → generic
 * adapter), behind flags, with a legacy fallback. It is additive and reversible:
 * flag off keeps the current ModeloBase1 flow verbatim, and any failure falls
 * back to it. It never replaces ModeloBase1, never writes to a backend/Prisma,
 * never calls fetch, never touches storage or the runtime bridge.
 */

export {
  MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_FLAG,
  EMPRESAS_GENERIC_KERNEL_FLAG,
  CADCPS_GENERIC_KERNEL_FLAG,
  MODELOBASE1_GENERIC_KERNEL_CONSUMPTION_ALLOW_PROD_FLAG,
  EMPRESAS_GENERIC_KERNEL_ALLOW_PROD_FLAG,
  CADCPS_GENERIC_KERNEL_ALLOW_PROD_FLAG,
  isEmpresasGenericKernelConsumptionRequested,
  isCadcpsGenericKernelConsumptionRequested,
  isModeloBase1GenericKernelConsumptionRequested,
  resolveModeloBase1GenericKernelConsumption,
} from './modeloBase1GenericKernelConsumptionConfig.js';

export { applyModeloBase1GenericKernelConsumption } from './applyModeloBase1GenericKernelConsumption.js';
export { createModeloBase1GenericKernelConsumptionDiagnostics } from './modeloBase1GenericKernelConsumptionDiagnostics.js';
export { createModeloBase1GenericKernelConsumptionFallback } from './modeloBase1GenericKernelConsumptionFallback.js';
export {
  ModeloBase1GenericKernelConsumptionError,
  consumptionError,
} from './modeloBase1GenericKernelConsumptionErrors.js';
