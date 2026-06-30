import { cn } from "@/shared/utils/utils";

export function UniversalTabs({ tabs, activeTab, onTabChange, className }) {
  return (
    <div className={cn("flex border-b border-border", className)}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={cn("studio-shell__tab", activeTab === tab.id && "studio-shell__tab--active")}
          onClick={() => onTabChange(tab.id)}
        >
          {tab.label}
        </button>
      ))}
    </div>
  );
}

export default UniversalTabs;
