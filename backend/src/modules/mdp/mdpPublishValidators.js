import { z } from "zod";
import { MDP_ENVIRONMENTS } from "./mdpPublishConstants.js";

const environmentEnum = z.enum(MDP_ENVIRONMENTS);
const snapshotTypeEnum = z.enum(["offline", "marketplace", "backup", "environment", "deployment"]);
const versionStatusEnum = z.enum(["draft", "published", "deprecated", "archived", "rolled_back"]);

export const mdpVersionListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  moduleId: z.string().min(1),
  baseTemplateId: z.string().optional(),
  status: versionStatusEnum.optional(),
  scope: z.enum(["platform", "tenant"]).optional(),
});

export const mdpDraftCreateSchema = z.object({
  moduleId: z.string().min(1),
  semver: z.string().optional(),
  baseTemplateId: z.string().optional(),
  changelog: z.string().nullable().optional(),
  parentVersionId: z.string().nullable().optional(),
  scope: z.enum(["platform", "tenant"]).optional(),
});

export const mdpCompileSchema = z.object({
  versionId: z.string().optional(),
  baseTemplateId: z.string().optional(),
  locale: z.string().optional(),
  draft: z
    .union([z.boolean(), z.enum(["true", "false"])])
    .transform((v) => (typeof v === "boolean" ? v : v === "true"))
    .optional(),
});

export const mdpPublishSchema = z.object({
  moduleId: z.string().min(1),
  versionId: z.string().optional(),
  semver: z.string().optional(),
  baseTemplateId: z.string().optional(),
  changelog: z.string().nullable().optional(),
  parentVersionId: z.string().nullable().optional(),
  environment: environmentEnum.optional(),
  pinEnvironments: z.array(environmentEnum).optional(),
  snapshotType: snapshotTypeEnum.optional(),
  scope: z.enum(["platform", "tenant"]).optional(),
});

const partialRollbackSchema = z
  .object({
    entryTypes: z.array(z.string()).optional(),
    registryEntryIds: z.array(z.string()).optional(),
  })
  .optional();

export const mdpRollbackSchema = z.object({
  moduleId: z.string().min(1),
  targetVersionId: z.string().min(1),
  currentVersionId: z.string().optional(),
  baseTemplateId: z.string().optional(),
  changelog: z.string().nullable().optional(),
  environment: environmentEnum.optional(),
  pinEnvironments: z.array(environmentEnum).optional(),
  partial: partialRollbackSchema,
  scope: z.enum(["platform", "tenant"]).optional(),
});

export const mdpSnapshotListQuerySchema = z.object({
  page: z.coerce.number().int().min(1).optional(),
  pageSize: z.coerce.number().int().min(1).max(200).optional(),
  moduleId: z.string().min(1),
  versionId: z.string().optional(),
});

export const mdpSnapshotCreateSchema = z.object({
  moduleId: z.string().min(1),
  versionId: z.string().min(1),
  snapshotType: snapshotTypeEnum,
  baseTemplateId: z.string().optional(),
  signatureRef: z.string().nullable().optional(),
  expiresAt: z.string().datetime().nullable().optional(),
});

export const mdpEnvironmentPinSchema = z.object({
  moduleId: z.string().min(1),
  versionId: z.string().min(1),
  environment: environmentEnum,
  baseTemplateId: z.string().optional(),
  scope: z.enum(["platform", "tenant"]).optional(),
});

export const mdpEnvironmentPinListQuerySchema = z.object({
  moduleId: z.string().min(1),
  scope: z.enum(["platform", "tenant"]).optional(),
});

export const mdpIntrospectQuerySchema = z.object({
  moduleId: z.string().optional(),
  versionId: z.string().optional(),
  baseTemplateId: z.string().optional(),
  locale: z.string().optional(),
  environment: environmentEnum.optional(),
  scope: z.enum(["platform", "tenant"]).optional(),
});

export const parseOrThrow = (schema, value) => {
  const result = schema.safeParse(value);
  if (!result.success) {
    const error = new Error(result.error.issues.map((i) => i.message).join("; "));
    error.statusCode = 400;
    throw error;
  }
  return result.data;
};
