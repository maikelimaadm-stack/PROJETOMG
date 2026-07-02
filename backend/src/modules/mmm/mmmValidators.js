import { z } from "zod";

const lifecycleStatus = z.enum([
  "draft",
  "review",
  "approved",
  "published",
  "active",
  "deprecated",
  "archived",
  "rejected",
  "deleted",
]);

export const mmmListQuerySchema = z.object({
  tenantId: z.string().min(1),
  objectType: z.string().min(1).optional(),
  moduleId: z.string().min(1).optional(),
  status: lifecycleStatus.optional(),
  cursor: z.string().min(1).optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
});

export const mmmEnvelopeCreateSchema = z.object({
  objectId: z.string().uuid().optional(),
  objectType: z.string().min(1),
  tenantId: z.string().min(1).optional(),
  scope: z.record(z.string(), z.unknown()),
  labels: z.array(z.record(z.string(), z.unknown())).min(1),
  lineage: z.object({ source: z.string().min(1) }).passthrough(),
  payload: z.record(z.string(), z.unknown()),
  dependencies: z.record(z.string(), z.unknown()).optional(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
});

export const mmmEnvelopeReplaceSchema = mmmEnvelopeCreateSchema.extend({
  envelopeVersion: z.literal("mmm-envelope-v1"),
  objectId: z.string().uuid(),
  status: lifecycleStatus,
  revision: z.number().int().min(1),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const mmmEnvelopePatchSchema = z.object({
  revision: z.number().int().min(1).optional(),
  status: lifecycleStatus.optional(),
  labels: z.array(z.record(z.string(), z.unknown())).optional(),
  payload: z.record(z.string(), z.unknown()).optional(),
  dependencies: z.record(z.string(), z.unknown()).optional(),
  scope: z.record(z.string(), z.unknown()).optional(),
  lineage: z.object({ source: z.string().min(1) }).passthrough().optional(),
});

export const mmmBatchCreateSchema = z.object({
  derivationPlanId: z.string().min(1),
  confirmationRef: z.string().min(1),
  objects: z.array(mmmEnvelopeCreateSchema).min(1),
});

export const mmmPublishSchema = z.object({
  tenantId: z.string().min(1),
  environment: z.enum(["staging", "production"]).optional(),
  applicationId: z.string().optional(),
  moduleId: z.string().optional(),
  objectIds: z.array(z.string()).optional(),
  semver: z.string().optional(),
  changelog: z.string().optional(),
});

export const mmmPublishPinSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  environment: z.enum(["staging", "production"]),
  definitionVersionId: z.string().min(1),
  applicationId: z.string().optional(),
  baseTemplateId: z.string().optional(),
});

export const mmmPublishRollbackSchema = z.object({
  tenantId: z.string().min(1),
  moduleId: z.string().min(1),
  environment: z.enum(["staging", "production"]),
  definitionVersionId: z.string().optional(),
  baseTemplateId: z.string().optional(),
});

export const mmmPublishVersionsQuerySchema = z.object({
  tenantId: z.string().min(1).optional(),
  moduleId: z.string().optional(),
  limit: z.coerce.number().int().min(1).max(200).optional(),
  skip: z.coerce.number().int().min(0).optional(),
});

export const mmmPublishPinQuerySchema = z.object({
  tenantId: z.string().min(1).optional(),
  moduleId: z.string().min(1),
  environment: z.enum(["staging", "production"]),
  baseTemplateId: z.string().optional(),
});

export const mmmRollbackSchema = z.object({
  revision: z.number().int().min(1).optional(),
  snapshotId: z.string().min(1).optional(),
});

export const parseOrThrow = (schema, value) => {
  const parsed = schema.safeParse(value);
  if (!parsed.success) {
    const error = new Error(parsed.error.issues.map((issue) => issue.message).join("; "));
    error.statusCode = 422;
    error.code = "VALIDATION_ERROR";
    throw error;
  }
  return parsed.data;
};
