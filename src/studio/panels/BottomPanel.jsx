import { UniversalTabs } from "@/studio/components/index.js";
import { useStudioShell } from "../shell/StudioShellProvider.jsx";

export function BottomPanel() {
  const { bottomTab, setBottomTab } = useStudioShell();

  const tabs = [
    { id: "preview", label: "Preview" },
    { id: "console", label: "Runtime Console" },
    { id: "validation", label: "Validação" },
  ];

  return (
    <div className="flex h-full flex-col">
      <UniversalTabs tabs={tabs} activeTab={bottomTab} onTabChange={setBottomTab} />
      <div className="flex flex-1 items-center justify-center p-4 text-xs text-muted-foreground">
        {bottomTab === "preview" && "Preview simulado — compile path no Program 2.1B"}
        {bottomTab === "console" && "Runtime Console — logs simulados (vazio)"}
        {bottomTab === "validation" && "Nenhum erro de validação (mock)"}
      </div>
    </div>
  );
}

export default BottomPanel;
