import { useInspectorProvider } from "./providers/InspectorProvider.jsx";

export function UniversalInspector() {
  const { fields, emptyState } = useInspectorProvider();

  if (!fields?.length) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
        {emptyState ?? "Selecione uma entrada"}
      </div>
    );
  }

  return (
    <div className="space-y-3 p-3 text-xs">
      {fields.map((field) => (
        <div key={field.label}>
          <div className="text-[10px] font-semibold uppercase text-muted-foreground">{field.label}</div>
          <div>{field.value}</div>
        </div>
      ))}
    </div>
  );
}

export default UniversalInspector;
