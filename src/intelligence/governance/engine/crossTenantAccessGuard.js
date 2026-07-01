export function enforceCrossTenantAccessGuard(groupId, ctx, requestedTenantIds = []) {
  if (!ctx.authorized) {
    return Object.freeze({
      allowed: false,
      reason: "Escopo de grupo não autorizado.",
      crossTenantMixingForbidden: true,
    });
  }

  const unauthorized = requestedTenantIds.filter((tid) => !ctx.authorizedTenantIds.includes(tid));
  if (unauthorized.length) {
    return Object.freeze({
      allowed: false,
      reason: `${unauthorized.length} tenant(s) fora do escopo autorizado.`,
      blockedTenantIds: Object.freeze(unauthorized),
      crossTenantMixingForbidden: true,
      explainable: true,
    });
  }

  return Object.freeze({
    allowed: true,
    authorizedTenantIds: ctx.authorizedTenantIds,
    crossTenantMixingForbidden: true,
    explainable: true,
  });
}

export default enforceCrossTenantAccessGuard;
