import { z } from "zod";

const cardinalitySchema = z.object({
  minFrom: z.number().int().min(0).nullable().optional(),
  maxFrom: z.number().int().min(0).nullable().optional(),
  minTo: z.number().int().min(0).nullable().optional(),
  maxTo: z.number().int().min(0).nullable().optional(),
});

const fkMappingSchema = z
  .object({
    fromField: z.string().optional(),
    toField: z.string().optional(),
  })
  .optional();

const labelSchema = z.object({
  locale: z.string().min(2).max(16),
  label: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  helpText: z.string().nullable().optional(),
});

const fieldBindingSchema = z.object({
  fieldRowId: z.string().optional(),
  fromFieldName: z.string().optional(),
  toFieldName: z.string().optional(),
  bindingRole: z.string().optional(),
});

export const mdpRelationshipListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  fromEntityId: z.string().optional(),
  toEntityId: z.string().optional(),
  entityId: z.string().optional(),
  kind: z.enum(["physical", "logical", "computed"]).optional(),
  relationshipType: z.enum(["one_to_one", "one_to_many", "many_to_many"]).optional(),
  dependencyClass: z
    .enum([
      "data",
      "workflow",
      "automation",
      "dashboard",
      "pivot",
      "report",
      "permission",
      "layout",
      "ai_context",
      "integration",
    ])
    .optional(),
  enabled: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .optional(),
  lifecycle: z.enum(["draft", "active", "deprecated", "archived"]).optional(),
});

export const mdpRelationshipCreateSchema = z.object({
  relationshipId: z.string().min(1).max(128),
  fromEntityId: z.string().min(1).max(128),
  toEntityId: z.string().min(1).max(128),
  kind: z.enum(["physical", "logical", "computed"]).default("physical"),
  relationshipType: z.enum(["one_to_one", "one_to_many", "many_to_many"]),
  semantics: z
    .enum(["association", "composition", "aggregation", "inheritance", "dependency"])
    .optional(),
  dependency: z.enum(["restrict", "cascade", "set_null", "optional"]).optional(),
  dependencyClass: z
    .enum([
      "data",
      "workflow",
      "automation",
      "dashboard",
      "pivot",
      "report",
      "permission",
      "layout",
      "ai_context",
      "integration",
    ])
    .optional(),
  cardinality: cardinalitySchema,
  fkMapping: fkMappingSchema,
  inheritanceParentEntityId: z.string().nullable().optional(),
  empresaScoped: z.boolean().optional(),
  enabled: z.boolean().optional(),
  baseTemplateId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  presentation: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  labels: z.array(labelSchema).min(1),
  fieldBindings: z.array(fieldBindingSchema).optional(),
});

export const mdpRelationshipUpdateSchema = mdpRelationshipCreateSchema
  .partial()
  .omit({ relationshipId: true, fromEntityId: true, toEntityId: true });

export const parseOrThrow = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    const error = new Error(result.error.issues.map((i) => i.message).join("; "));
    error.statusCode = 400;
    throw error;
  }
  return result.data;
};
