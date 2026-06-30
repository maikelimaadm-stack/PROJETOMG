import "./studioShellPrototype.css";
import { StudioProductionShellProvider } from "./StudioProductionShellProvider.jsx";
import { StudioAuthGate } from "./StudioAuthGate.jsx";
import { StudioTopBar } from "./StudioTopBar.jsx";
import { StudioStatusBar } from "./StudioStatusBar.jsx";
import { StudioCommandPalette } from "./StudioCommandPalette.jsx";
import { StudioLeftNav } from "../navigation/StudioLeftNav.jsx";
import { StudioDockManager } from "../dock/StudioDockManager.jsx";

/** Production Studio Shell — Program 2.1B (MDP + auth + persistence). */
export function StudioShell({ moduleId, designerId }) {
  return (
    <StudioAuthGate>
      <StudioProductionShellProvider moduleId={moduleId} designerId={designerId}>
        <div className="studio-shell flex h-screen max-h-screen flex-col overflow-hidden">
          <StudioTopBar />
          <div className="flex min-h-0 flex-1">
            <StudioLeftNav />
            <StudioDockManager />
          </div>
          <StudioStatusBar />
          <StudioCommandPalette />
        </div>
      </StudioProductionShellProvider>
    </StudioAuthGate>
  );
}

export default StudioShell;
