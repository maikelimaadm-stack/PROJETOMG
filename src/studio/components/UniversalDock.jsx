import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/shared/ui/resizable";
import { useDockProvider } from "./providers/DockProvider.jsx";
import { UniversalTabs } from "./UniversalTabs.jsx";

export function UniversalDock() {
  const { visibility, left, right, bottom, renderCenter } = useDockProvider();

  const centerSize =
    visibility.left && visibility.right ? 50 : visibility.left || visibility.right ? 70 : 100;

  return (
    <ResizablePanelGroup direction="horizontal" className="min-h-0 flex-1">
      {visibility.left && left && (
        <>
          <ResizablePanel defaultSize={20} minSize={15} maxSize={35} className="studio-shell__panel flex flex-col">
            <UniversalTabs tabs={left.tabs} activeTab={left.activeTab} onTabChange={left.onTabChange} />
            <div className="min-h-0 flex-1 overflow-hidden">{left.renderContent(left.activeTab)}</div>
          </ResizablePanel>
          <ResizableHandle withHandle />
        </>
      )}

      <ResizablePanel defaultSize={centerSize} minSize={30}>
        <ResizablePanelGroup direction="vertical">
          <ResizablePanel defaultSize={visibility.bottom ? 70 : 100} minSize={40}>
            <div className="studio-shell__panel h-full overflow-auto">{renderCenter()}</div>
          </ResizablePanel>
          {visibility.bottom && bottom && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel defaultSize={30} minSize={15} maxSize={45}>
                <div className="studio-shell__panel flex h-full flex-col">
                  <UniversalTabs
                    tabs={bottom.tabs}
                    activeTab={bottom.activeTab}
                    onTabChange={bottom.onTabChange}
                  />
                  <div className="min-h-0 flex-1 overflow-hidden">
                    {bottom.renderContent(bottom.activeTab)}
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </ResizablePanel>

      {visibility.right && right && (
        <>
          <ResizableHandle withHandle />
          <ResizablePanel defaultSize={22} minSize={18} maxSize={35} className="studio-shell__panel flex flex-col">
            <UniversalTabs tabs={right.tabs} activeTab={right.activeTab} onTabChange={right.onTabChange} />
            <div className="min-h-0 flex-1 overflow-hidden">{right.renderContent(right.activeTab)}</div>
          </ResizablePanel>
        </>
      )}
    </ResizablePanelGroup>
  );
}

export default UniversalDock;
