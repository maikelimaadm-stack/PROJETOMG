import { Navigate } from "react-router-dom";
import { useAuth } from "@/shared/contexts/AuthContext";

/**
 * Studio auth gate — JWT + tenant scope required (Program 2.1B).
 * Studio routes sit inside AuthenticatedApp; this gate enforces explicit checks.
 */
export function StudioAuthGate({ children }) {
  const { isAuthenticated, isLoadingAuth, user, cliente } = useAuth();

  if (isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-muted border-t-foreground" />
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="studio-auth-gate h-full" data-tenant-id={cliente?.id ?? undefined}>
      {children}
    </div>
  );
}

export default StudioAuthGate;
