import "./studioShellPrototype.css";
import { StudioShellProvider } from "./StudioShellProvider.jsx";
import { StudioTopBar } from "./StudioTopBar.jsx";
import { StudioStatusBar } from "./StudioStatusBar.jsx";
import { StudioCommandPalette } from "./StudioCommandPalette.jsx";
import { StudioLeftNav } from "../navigation/StudioLeftNav.jsx";
import { StudioDockManager } from "../dock/StudioDockManager.jsx";

export function StudioShellPrototype() {
  return (
    <StudioShellProvider>
      <div className="studio-shell flex h-screen max-h-screen flex-col overflow-hidden">
        <StudioTopBar />
        <div className="flex min-h-0 flex-1">
          <StudioLeftNav />
          <StudioDockManager />
        </div>
        <StudioStatusBar />
        <StudioCommandPalette />
      </div>
    </StudioShellProvider>
  );
}

export default StudioShellPrototype;
