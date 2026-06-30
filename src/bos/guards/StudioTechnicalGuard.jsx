import { Navigate, useParams } from "react-router-dom";

/**
 * Blocks business users from technical Studio surfaces (D-074, Expert boundary).
 * Formula Builder is never a business-user destination.
 */
export function StudioTechnicalGuard({ children }) {
  const { designerId } = useParams();
  const blockedDesigners = new Set(["formula"]);

  if (designerId && blockedDesigners.has(designerId)) {
    return (
      <Navigate
        to="/bos/business-first?blocked=formula"
        replace
        state={{
          reason: "formula_builder_blocked",
          message:
            "Formula Builder é ferramenta técnica de plataforma. Use Business First para criar regras em linguagem de negócio.",
        }}
      />
    );
  }

  return children;
}

export default StudioTechnicalGuard;
