import { GOVERNANCE_PERMISSIONS } from "./permissionRegistry.js";

export function buildRolePermissionMatrix(groupId, ctx, permissionRegistry) {
  if (!ctx.authorized) return Object.freeze({ matrix: [] });

  const roles = [
    Object.freeze({
      role: "administrador_autorizado",
      label: "Administrador autorizado",
      permissions: Object.freeze([
        GOVERNANCE_PERMISSIONS.REVIEW_AUDIT,
        GOVERNANCE_PERMISSIONS.VIEW_PORTFOLIO,
        GOVERNANCE_PERMISSIONS.COMPARE_TENANTS,
      ]),
      requiresHumanApproval: true,
    }),
    Object.freeze({
      role: "gestor_executivo",
      label: "Gestor executivo",
      permissions: Object.freeze([
        GOVERNANCE_PERMISSIONS.VIEW_PORTFOLIO,
        GOVERNANCE_PERMISSIONS.COMPARE_TENANTS,
        GOVERNANCE_PERMISSIONS.AGGREGATE_DATA,
      ]),
      requiresHumanApproval: false,
    }),
    Object.freeze({
      role: "operador_empresa",
      label: "Operador de empresa",
      permissions: Object.freeze([]),
      requiresHumanApproval: false,
    }),
  ];

  return Object.freeze({
    groupId,
    matrix: Object.freeze(roles),
    activePermissionCount: permissionRegistry.permissions?.filter((p) => p.granted)?.length ?? 0,
    explainable: true,
  });
}

export default buildRolePermissionMatrix;
