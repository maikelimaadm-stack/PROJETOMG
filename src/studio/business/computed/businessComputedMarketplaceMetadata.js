export function createBusinessComputedMarketplaceMetadata(partial = {}) {
  return Object.freeze({
    schemaVersion: "mak-business-computed-marketplace-metadata-v1",
    marketplaceEligible: partial.marketplaceEligible !== false,
    packageId: partial.packageId ?? null,
    listingId: partial.listingId ?? null,
    sharesBusinessAssetOnly: true,
    sharesTechnicalImplementation: false,
  });
}

export default createBusinessComputedMarketplaceMetadata;
