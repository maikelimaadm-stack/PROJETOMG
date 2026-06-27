/**
 * @deprecated Runtime imperativo substituído por EMP_FORM_FIELD_DEFS + Foundation (V15).
 * Mantido para retrocompatibilidade de imports legados.
 */
import { buildMakDynamicFieldsWithCustomFields } from "@/framework/mak/fieldConfig/buildMakDynamicFieldsWithCustomFields.js";
import { EMP_FORM_FIELD_DEFS } from "@/modules/empresas/components/formEmp.constants.js";

export const buildEmpresasDynamicFields = buildMakDynamicFieldsWithCustomFields(EMP_FORM_FIELD_DEFS);

export default buildEmpresasDynamicFields;
