# Field / Action / Permission Bridge Schemas

- **Field:** each field maps to an ALLOWED placeholder component kind by type
  (text→input-placeholder, boolean→boolean-placeholder, date→date-placeholder,
  number→number-placeholder, select→select-placeholder, protected→label). `allComponentsAllowed`
  proves no field maps outside the allowed set. No real input.
- **Action:** every action disabled (`enabled: false`); mutation actions flagged but never
  enabled; `button-placeholder` only; `anyEnabled` and `mutationAllowed` are `false`.
- **Permission:** hints only — `defaultDeny`, `failClosed`, `tenantRequired` default true;
  `enforcementEngine` and `grantsAccess` are `false`.
