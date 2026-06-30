import { useParams, Navigate } from "react-router-dom";
import { StudioShell } from "../shell/StudioShell.jsx";

const DEFAULT_MODULE = "empresas";
const DEFAULT_DESIGNER = "layout";

/** Production Studio page — Program 2.1B. */
export default function StudioProductionPage() {
  const { moduleId, designerId } = useParams();

  if (!moduleId) {
    return <Navigate to={`/studio/${DEFAULT_MODULE}/${DEFAULT_DESIGNER}`} replace />;
  }

  return (
    <StudioShell
      moduleId={moduleId}
      designerId={designerId ?? DEFAULT_DESIGNER}
    />
  );
}
