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
      <div className="flex border-b border-border">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            className={`studio-shell__tab ${bottomTab === tab.id ? "studio-shell__tab--active" : ""}`}
            onClick={() => setBottomTab(tab.id)}
          >
            {tab.label}
          </button>
        ))}
      </div>
      <div className="flex flex-1 items-center justify-center p-4 text-xs text-muted-foreground">
        {bottomTab === "preview" && "Preview simulado — compile path no Program 2.1B"}
        {bottomTab === "console" && "Runtime Console — logs simulados (vazio)"}
        {bottomTab === "validation" && "Nenhum erro de validação (mock)"}
      </div>
    </div>
  );
}

export default BottomPanel;
