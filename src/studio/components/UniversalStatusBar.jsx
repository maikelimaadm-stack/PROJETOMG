import { useStatusBarProvider } from "./providers/StatusBarProvider.jsx";

export function UniversalStatusBar() {
  const { leftItems, rightItems } = useStatusBarProvider();

  return (
    <footer className="studio-shell__statusbar flex items-center justify-between px-3 py-0.5 text-muted-foreground">
      <div className="flex items-center gap-3">
        {leftItems.map((item, index) => (
          <span key={item.id} className="flex items-center gap-3">
            {index > 0 && <span>·</span>}
            <span>{item.content}</span>
          </span>
        ))}
      </div>
      <div className="flex items-center gap-3">
        {rightItems.map((item) => (
          <span key={item.id}>{item.content}</span>
        ))}
      </div>
    </footer>
  );
}

export default UniversalStatusBar;
