/** Field-specific property schemas — registered on SOM Property Engine */

export function registerFieldPropertySchemas(propertyEngine) {
  ["fieldType", "label", "fieldName", "required", "readOnly", "visibleForm", "visibleTable", "active"].forEach(
    (id) => {
      propertyEngine.registerPropertySchema({ id, kind: id === "required" ? "boolean" : "string" });
    }
  );
  propertyEngine.registerPropertySchema({ id: "required", kind: "boolean", defaultValue: false });
  propertyEngine.registerPropertySchema({ id: "readOnly", kind: "boolean", defaultValue: false });
  propertyEngine.registerPropertySchema({ id: "visibleForm", kind: "boolean", defaultValue: true });
  propertyEngine.registerPropertySchema({ id: "visibleTable", kind: "boolean", defaultValue: false });
  propertyEngine.registerPropertySchema({ id: "active", kind: "boolean", defaultValue: true });
}

export default registerFieldPropertySchemas;
