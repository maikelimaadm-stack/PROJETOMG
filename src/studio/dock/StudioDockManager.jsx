import { cn } from "@/shared/utils/utils";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/ui/resizable";
import { useStudioShell } from "../shell/StudioShellProvider.jsx";
import { ExplorerPanel } from "../panels/ExplorerPanel.jsx";
import { InspectorPanel } from "../panels/InspectorPanel.jsx";
import { PropertyGridPanel } from "../panels/PropertyGridPanel.jsx";
import { WorkspacePanel } from "../panels/WorkspacePanel.jsx";
import { BottomPanel } from "../panels/BottomPanel.jsx";

function DockTabs({ tabs, active, onChange }) {
  return (
    <div className="flex border-b border-border">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn("studio-shell__tab", active === tab.id && "studio-shell__tab--active")}
          onClick={() => onChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export function StudioDockManager() {
  const { dockState, leftTab, setLeftTab, rightTab, setRightTab } = useStudioShell();

  const leftTabs = [
    { id: "explorer", label: "Explorer" },
    { id: "outline", label: "Outline" },
    { id: "assets", label: "Assets" },
  ];

  const rightTabs = [
    { id: "inspector", label: "Inspector" },
    { id: "properties", label: "Property Grid" },
  ];

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
      {dockState.left && (
        <>
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35} className="studio-shell__panel flex flex-col">
            <DockTabs tabs={leftTabs} active={leftTab} onChange={setLeftTab} />
            <div className="min-h-0 flex-1 overflow-hidden">
              {leftTab === "explorer" && <ExplorerPanel />}
              {leftTab === "outline" && (
                <div className="p-3 text-xs text-muted-foreground">Outline (mock) — sincronizado com Explorer</div>
              )}
              {leftTab === "assets" && (
                <div className="p-3 text-xs text-muted-foreground">Asset Manager (stub)</div>
              )}
            </div>
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}

      <ResizablePanel defaultSize={dockState.left && dockState.right ? 50 : 70} minSize={30}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={dockState.bottom ? 70 : 100} minSize={40}>
            <div className="studio-shell__panel h-full overflow-auto">
              <WorkspacePanel />
            </div>
          </ResizablePanel>
          {dockState.bottom && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={15} maxSize={45}>
                <div className="studio-shell__panel h-full">
                  <BottomPanel />
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>

      {dockState.right && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={22} minSize={18} maxSize={35} className="studio-shell__panel flex flex-col">
            <DockTabs tabs={rightTabs} active={rightTab} onChange={setRightTab} />
            <div className="min-h-0 flex-1 overflow-hidden">
              {rightTab === "inspector" && <InspectorPanel />}
              {rightTab === "properties" && <PropertyGridPanel />}
            </div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

export default StudioDockManager;
