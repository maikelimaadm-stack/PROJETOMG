import { useMemo } from "react";
import { useAuth } from "@/shared/contexts/AuthContext";

const ROLE_RANK = {
  CONSULTA: 1,
  OPERADOR: 2,
  ADMIN: 3,
};

const normalizeRole = (perfil) => String(perfil || "OPERADOR").trim().toUpperCase();

/**
 * RBAC frontend mínimo — espelha perfis backend (ADMIN, OPERADOR, CONSULTA).
 */
export function useMakPermissions(requiredRoles = null) {
  const { user, isAuthenticated } = useAuth();
  const role = normalizeRole(user?.perfil);

  return useMemo(() => {
    const rank = ROLE_RANK[role] ?? ROLE_RANK.OPERADOR;
    const can = (roles) => {
      if (!isAuthenticated) return false;
      const list = Array.isArray(roles) ? roles : [roles];
      return list.some((item) => {
        const required = normalizeRole(item);
        return rank >= (ROLE_RANK[required] ?? ROLE_RANK.OPERADOR);
      });
    };

    return {
      role,
      isAuthenticated,
      canView: can(["CONSULTA", "OPERADOR", "ADMIN"]),
      canEdit: can(["OPERADOR", "ADMIN"]),
      canCreate: can(["OPERADOR", "ADMIN"]),
      canDelete: can(["ADMIN"]),
      canExport: can(["ADMIN"]),
      canConfigure: can(["ADMIN"]),
      can: (roles) => can(roles),
      satisfies: requiredRoles ? can(requiredRoles) : true,
    };
  }, [isAuthenticated, role, requiredRoles]);
}
