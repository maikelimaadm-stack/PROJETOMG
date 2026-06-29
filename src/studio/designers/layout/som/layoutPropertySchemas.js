/** Layout-specific property schemas — registered on SOM Property Engine */

export function registerLayoutPropertySchemas(propertyEngine) {
  propertyEngine.registerPropertySchema({
    id: "fieldId",
    kind: "string",
    validate: (value) => (value ? [] : ["fieldId cannot be empty for field components."]),
  });

  propertyEngine.registerPropertySchema({
    id: "sectionRef",
    kind: "string",
  });

  propertyEngine.registerPropertySchema({
    id: "label",
    kind: "string",
    defaultValue: "",
  });

  propertyEngine.registerPropertySchema({
    id: "visible",
    kind: "boolean",
    defaultValue: true,
  });

  propertyEngine.registerPropertySchema({
    id: "readOnly",
    kind: "boolean",
    defaultValue: false,
  });
}

export default registerLayoutPropertySchemas;
