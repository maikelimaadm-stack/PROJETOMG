/** Field Studio command types — Program 2.3 + 2.3.1 */

export const FieldCommandTypes = Object.freeze({
  ADD_FIELD: "field/command/addField",
  ADD_FIELD_FROM_TEMPLATE: "field/command/addFieldFromTemplate",
  ADD_FIELD_FROM_BUSINESS_TYPE: "field/command/addFieldFromBusinessType",
  DELETE_FIELD: "field/command/deleteField",
  REORDER_FIELD: "field/command/reorderField",
  UPDATE_PROPERTY: "field/command/updateProperty",
  ADD_GROUP: "field/command/addGroup",
  ASSIGN_FIELD_GROUP: "field/command/assignFieldGroup",
});

export default FieldCommandTypes;
