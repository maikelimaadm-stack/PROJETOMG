/** Official Studio Property catalog — reusable across all components. */
export const STUDIO_PROPERTY_CATALOG = [
  { propertyId: "label", label: "Label", valueType: "string", group: "display", defaultValue: "" },
  { propertyId: "placeholder", label: "Placeholder", valueType: "string", group: "display", defaultValue: "" },
  { propertyId: "tooltip", label: "Tooltip", valueType: "string", group: "display", defaultValue: "" },
  { propertyId: "width", label: "Width", valueType: "dimension", group: "layout", defaultValue: "auto" },
  { propertyId: "height", label: "Height", valueType: "dimension", group: "layout", defaultValue: "auto" },
  { propertyId: "required", label: "Required", valueType: "boolean", group: "validation", defaultValue: false },
  { propertyId: "visible", label: "Visible", valueType: "boolean", group: "display", defaultValue: true },
  { propertyId: "color", label: "Color", valueType: "color", group: "theme", defaultValue: null },
  { propertyId: "theme", label: "Theme", valueType: "theme", group: "theme", defaultValue: "default" },
  { propertyId: "permission", label: "Permission", valueType: "permission", group: "security", defaultValue: null },
  { propertyId: "validation", label: "Validation", valueType: "validationRule[]", group: "validation", defaultValue: [] },
  { propertyId: "readOnly", label: "Read Only", valueType: "boolean", group: "behavior", defaultValue: false },
  { propertyId: "disabled", label: "Disabled", valueType: "boolean", group: "behavior", defaultValue: false },
  { propertyId: "hidden", label: "Hidden", valueType: "boolean", group: "display", defaultValue: false },
  { propertyId: "sortOrder", label: "Sort Order", valueType: "number", group: "layout", defaultValue: 0 },
];

export default STUDIO_PROPERTY_CATALOG;
