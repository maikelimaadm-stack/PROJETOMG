import { useEffect, useState } from "react";
import { Input } from "@/shared/ui/input";
import { Label } from "@/shared/ui/label";
import { Switch } from "@/shared/ui/switch";
import { useStudioShell } from "../shell/StudioShellProvider.jsx";
import { MOCK_PROPERTY_SCHEMA } from "../mock/studioMockData.js";

export function PropertyGridPanel() {
  const { sdk, hub } = useStudioShell();
  const [selection, setSelection] = useState(sdk.selection.getSelection());
  const [fields, setFields] = useState(MOCK_PROPERTY_SCHEMA);

  useEffect(() => sdk.selection.subscribe(setSelection), [sdk.selection]);

  if (!selection.entryId) {
    return (
      <div className="flex h-full items-center justify-center p-4 text-center text-xs text-muted-foreground">
        Property Grid — selecione uma entrada
      </div>
    );
  }

  const groups = [...new Set(fields.map((f) => f.group))];

  const updateField = (propertyId, nextValue) => {
    setFields((prev) =>
      prev.map((f) => (f.propertyId === propertyId ? { ...f, value: nextValue } : f))
    );
    hub.publish("property.changed", {
      propertyId,
      entryId: selection.entryId,
      previousValue: null,
      nextValue,
      source: "property-grid",
    });
  };

  return (
    <div className="h-full overflow-auto p-3">
      <p className="mb-3 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
        Property Grid
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
                      onCheckedChange={(v) => updateField(field.propertyId, v)}
                      className="mt-1"
                    />
                  ) : (
                    <Input
                      className="mt-1 h-8 text-xs"
                      value={String(field.value ?? "")}
                      onChange={(e) => updateField(field.propertyId, e.target.value)}
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

export default PropertyGridPanel;
