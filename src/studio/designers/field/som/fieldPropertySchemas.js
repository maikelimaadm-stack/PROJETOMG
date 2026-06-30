/** Field-specific property schemas — registered on SOM Property Engine */

const STRING_PROPS = [
  "fieldType",
  "label",
  "fieldName",
  "category",
  "groupId",
  "placeholder",
  "helpText",
  "maskText",
  "defaultValue",
  "smartTemplateId",
  "businessTypeId",
];

const BOOLEAN_PROPS = ["required", "readOnly", "visibleForm", "visibleTable", "active", "useMask"];

const NUMBER_PROPS = ["minValue", "maxValue", "precision", "scale"];

export function registerFieldPropertySchemas(propertyEngine) {
  STRING_PROPS.forEach((id) => {
    propertyEngine.registerPropertySchema({ id, kind: "string" });
  });
  BOOLEAN_PROPS.forEach((id) => {
    propertyEngine.registerPropertySchema({ id, kind: "boolean", defaultValue: id === "active" || id === "visibleForm" });
  });
  NUMBER_PROPS.forEach((id) => {
    propertyEngine.registerPropertySchema({ id, kind: "number" });
  });
}

export default registerFieldPropertySchemas;
