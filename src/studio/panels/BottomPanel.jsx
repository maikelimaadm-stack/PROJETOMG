import { UniversalTabs } from "@/studio/components/index.js";
import { useTabs } from "@/studio/domain/index.js";

export function BottomPanel() {
  const { tabs, setTab } = useTabs();

  const tabDefs = [
    { id: "preview", label: "Preview" },
    { id: "console", label: "Runtime Console" },
    { id: "validation", label: "Validação" },
  ];

  return (
    <div className="flex h-full flex-col">
      <UniversalTabs tabs={tabDefs} activeTab={tabs.bottom} onTabChange={(id) => setTab("bottom", id)} />
      <div className="flex flex-1 items-center justify-center p-4 text-xs text-muted-foreground">
        {tabs.bottom === "preview" && "Preview simulado — compile path no Program 2.1B"}
        {tabs.bottom === "console" && "Runtime Console — logs simulados (vazio)"}
        {tabs.bottom === "validation" && "Nenhum erro de validação (mock)"}
      </div>
    </div>
  );
}

export default BottomPanel;
