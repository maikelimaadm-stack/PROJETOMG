import { z } from "zod";

export const mdpFieldListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  entityId: z.string().optional(),
  moduleId: z.string().optional(),
  source: z.enum(["native", "custom", "computed", "derived", "system", "virtual"]).optional(),
  fieldType: z.string().optional(),
  lifecycle: z.enum(["draft", "active", "deprecated", "archived"]).optional(),
  active: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .optional(),
});

const labelSchema = z.object({
  locale: z.string().min(2).max(16),
  label: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  helpText: z.string().nullable().optional(),
  placeholder: z.string().nullable().optional(),
});

const optionSchema = z.object({
  code: z.string().min(1).max(64),
  label: z.string().min(1).max(255),
  sortOrder: z.number().int().optional(),
  active: z.boolean().optional(),
});

export const mdpFieldCreateSchema = z.object({
  fieldId: z.string().min(1).max(128),
  entityId: z.string().min(1).max(128),
  fieldName: z.string().min(1).max(128),
  source: z.enum(["native", "custom", "computed", "derived", "system", "virtual"]).default("custom"),
  fieldType: z.string().min(1).max(64),
  labels: z.array(labelSchema).min(1),
  required: z.boolean().optional(),
  readOnly: z.boolean().optional(),
  active: z.boolean().optional(),
  searchable: z.boolean().optional(),
  filterable: z.boolean().optional(),
  exportable: z.boolean().optional(),
  auditable: z.boolean().optional(),
  visibleForm: z.boolean().optional(),
  visibleTable: z.boolean().optional(),
  visibleReport: z.boolean().optional(),
  empresaApplicability: z.enum(["all", "selected", "none"]).optional(),
  placeholder: z.string().nullable().optional(),
  formula: z.string().nullable().optional(),
  calculationBuilder: z.unknown().optional(),
  useMask: z.boolean().optional(),
  maskText: z.string().nullable().optional(),
  useDecimal: z.boolean().optional(),
  decimalPlaces: z.number().int().optional(),
  tableOrder: z.number().int().optional(),
  columnWidth: z.number().int().optional(),
  relationEntity: z.string().nullable().optional(),
  optionsLabelField: z.string().nullable().optional(),
  optionsValueField: z.string().nullable().optional(),
  validationRef: z.string().nullable().optional(),
  formulaRef: z.string().nullable().optional(),
  relationshipRef: z.string().nullable().optional(),
  presentation: z.record(z.string(), z.unknown()).optional(),
  baseTemplateId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  telaIds: z.array(z.string()).optional(),
  empresaIds: z.array(z.string()).optional(),
  options: z.array(optionSchema).optional(),
});

export const mdpFieldUpdateSchema = mdpFieldCreateSchema.partial().omit({ fieldId: true, entityId: true });

export const parseOrThrow = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    const error = new Error(result.error.issues.map((i) => i.message).join("; "));
    error.statusCode = 400;
    throw error;
  }
  return result.data;
};
