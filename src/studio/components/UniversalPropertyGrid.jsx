import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { usePropertyProvider } from "./providers/PropertyProvider.jsx";

export function UniversalPropertyGrid() {
  const { hasSelection, fields, onFieldChange, emptyState, title } = usePropertyProvider();

  if (!hasSelection) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
        {emptyState ?? "Property Grid — selecione uma entrada"}
      </div>
    );
  }

  const groups = [...new Set(fields.map((f) => f.group))];

  return (
    <div className="h-full overflow-auto p-3">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        {title ?? "Property Grid"}
      </p>
      {groups.map((group) => (
        <div key={group} className="mb-4">
          <h3 className="mb-2 text-xs font-semibold">{group}</h3>
          <div className="space-y-3">
            {fields
              .filter((f) => f.group === group)
              .map((field) => (
                <div key={field.propertyId}>
                  <Label className="text-xs">{field.label}</Label>
                  {field.type === "boolean" ? (
                    <Switch
                      checked={Boolean(field.value)}
                      onCheckedChange={(v) => onFieldChange(field.propertyId, v)}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={String(field.value ?? "")}
                      onChange={(e) => onFieldChange(field.propertyId, e.target.value)}
                    />
                  )}
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export default UniversalPropertyGrid;
