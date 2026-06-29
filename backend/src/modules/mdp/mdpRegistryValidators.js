import { z } from "zod";
import { MDP_REGISTRY_ENTRY_TYPES } from "./mdpRegistryConstants.js";

const entryTypeEnum = z.enum(MDP_REGISTRY_ENTRY_TYPES);

const labelSchema = z.object({
  locale: z.string().min(2).max(16),
  label: z.string().min(1).max(255),
  description: z.string().nullable().optional(),
  helpText: z.string().nullable().optional(),
});

const bindingSchema = z.object({
  bindingKind: z.enum(["entity", "field", "relationship", "module", "entry"]),
  targetId: z.string().min(1).max(128),
  targetRowId: z.string().nullable().optional(),
  sortOrder: z.number().int().optional(),
});

export const mdpRegistryListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  entryType: entryTypeEnum.optional(),
  moduleId: z.string().optional(),
  entityId: z.string().optional(),
  baseTemplateId: z.string().optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  enabled: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .optional(),
  lifecycle: z.enum(["draft", "active", "deprecated", "archived"]).optional(),
});

export const mdpRegistryIntrospectQuerySchema = z.object({
  moduleId: z.string().optional(),
});

export const mdpRegistryCreateSchema = z.object({
  entryId: z.string().min(1).max(128),
  entryType: entryTypeEnum,
  moduleId: z.string().nullable().optional(),
  entityId: z.string().nullable().optional(),
  payload: z.record(z.string(), z.unknown()),
  schemaVersion: z.string().min(1).max(32).optional(),
  status: z.enum(["draft", "published", "archived"]).optional(),
  ownerKind: z.enum(["platform", "tenant", "marketplace", "system"]).optional(),
  ownerRef: z.string().nullable().optional(),
  empresaScope: z.enum(["none", "optional", "required"]).optional(),
  enabled: z.boolean().optional(),
  baseTemplateId: z.string().optional(),
  sortOrder: z.number().int().optional(),
  presentation: z.record(z.string(), z.unknown()).optional(),
  metadata: z.record(z.string(), z.unknown()).optional(),
  labels: z.array(labelSchema).min(1),
  bindings: z.array(bindingSchema).optional(),
});

export const mdpRegistryUpdateSchema = mdpRegistryCreateSchema
  .partial()
  .omit({ entryId: true, entryType: true });

export const parseOrThrow = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    const error = new Error(result.error.issues.map((i) => i.message).join("; "));
    error.statusCode = 400;
    throw error;
  }
  return result.data;
};
