import { useWorkspaceProvider } from "./providers/WorkspaceProvider.jsx";

export function UniversalWorkspace() {
  const { title, subtitle, children, placeholder, emptyState } = useWorkspaceProvider();

  if (emptyState) {
    return (
      <div className="flex h-full items-center justify-center p-8 text-xs text-muted-foreground">
        {emptyState}
      </div>
    );
  }

  if (children) {
    return <div className="h-full overflow-auto">{children}</div>;
  }

  return (
    <div className="flex h-full flex-col items-center justify-center p-8">
      <div className="studio-shell__workspace-empty flex max-w-lg flex-col items-center gap-4 p-12 text-center">
        {title && <h2 className="text-lg font-semibold">{title}</h2>}
        {subtitle && <p className="text-sm text-muted-foreground">{subtitle}</p>}
        {placeholder}
      </div>
    </div>
  );
}

export default UniversalWorkspace;
