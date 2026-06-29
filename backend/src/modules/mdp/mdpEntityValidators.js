import { z } from "zod";

const persistenceSchema = z.object({
  prismaModel: z.string().min(1).max(128),
  tableName: z.string().min(1).max(128),
  primaryKey: z.string().min(1).max(64).default("id"),
  tenantKey: z.string().min(1).max(64).default("cliente_id"),
  empresaKey: z.string().max(64).optional().nullable(),
  idGlobalKey: z.string().max(64).optional().nullable(),
});

const labelSchema = z.object({
  locale: z.string().min(2).max(16),
  singular: z.string().min(1).max(255),
  plural: z.string().min(1).max(255),
  description: z.string().max(2000).optional().nullable(),
});

const capabilitiesSchema = z.object({
  layout: z.boolean().optional(),
  field: z.boolean().optional(),
  validation: z.boolean().optional(),
  formula: z.boolean().optional(),
  events: z.boolean().optional(),
  actions: z.boolean().optional(),
  workflow: z.boolean().optional(),
  customFields: z.boolean().optional(),
  attachments: z.boolean().optional(),
});

const routeSchema = z.object({
  routePath: z.string().min(1).max(255),
  pageCode: z.string().max(64).optional().nullable(),
  clientTarget: z.enum(["web", "mobile", "desktop", "all"]).optional(),
  menuSection: z.string().max(128).optional().nullable(),
  sortOrder: z.number().int().optional(),
  targetEntityId: z.string().max(128).optional().nullable(),
});

export const mdpEntityCreateSchema = z.object({
  entityId: z.string().min(1).max(128),
  moduleId: z.string().min(1).max(64),
  codigo: z.string().min(1).max(64),
  scope: z.enum(["platform", "tenant"]).optional(),
  entityKind: z.enum(["business", "meta", "system", "certification"]).optional(),
  sortOrder: z.number().int().optional(),
  iconKey: z.string().max(64).optional().nullable(),
  extendsEntityId: z.string().max(128).optional().nullable(),
  originKind: z.enum(["platform", "tenant", "marketplace"]).optional(),
  originRef: z.string().max(128).optional().nullable(),
  isRuntimeModule: z.boolean().optional(),
  legacyEntityName: z.string().max(128).optional().nullable(),
  permissionResourceKey: z.string().max(128).optional().nullable(),
  baseTemplateId: z.string().max(64).optional(),
  empresaScope: z.enum(["none", "optional", "required"]).optional(),
  lifecycle: z.enum(["draft", "active", "deprecated", "archived"]).optional(),
  persistence: persistenceSchema,
  labels: z.array(labelSchema).min(1).optional(),
  capabilities: capabilitiesSchema.optional(),
  routes: z.array(routeSchema).optional(),
});

export const mdpEntityUpdateSchema = mdpEntityCreateSchema
  .partial()
  .refine((value) => Object.keys(value).length > 0, {
    message: "Informe ao menos um campo para atualização.",
  });

export const mdpEntityListQuerySchema = z.object({
  moduleId: z.string().max(64).optional(),
  lifecycle: z.enum(["draft", "active", "deprecated", "archived"]).optional(),
  entityKind: z.enum(["business", "meta", "system", "certification"]).optional(),
  runtimeOnly: z
    .union([z.literal("true"), z.literal("false"), z.boolean()])
    .optional(),
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
});

export const parseOrThrow = (schema, payload) => {
  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    const message = parsed.error.issues.map((issue) => issue.message).join("; ");
    const error = new Error(message || "Payload inválido.");
    error.statusCode = 400;
    throw error;
  }
  return parsed.data;
};
