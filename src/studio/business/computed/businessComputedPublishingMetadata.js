export function createBusinessComputedPublishingMetadata(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-publishing-metadata-v1",
    publishable: partial.publishable !== false,
    published: partial.published ?? false,
    publishedAt: partial.publishedAt ?? null,
    publishedBy: partial.publishedBy ?? null,
    publicationChannel: partial.publicationChannel ?? null,
    sharePolicy: partial.sharePolicy ?? "organization_only",
  });
}

export default createBusinessComputedPublishingMetadata;
