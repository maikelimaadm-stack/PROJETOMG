# Allowed Component Contract

Enumerates the 16 ALLOWED placeholder component kinds and the 13 permanently BLOCKED kinds
(`react-component`, `jsx`, `tsx`, `router`, `route`, `menu`, `nav`, `iframe`, `script`,
`fetch-widget`, `mutation-button`, `real-input`, `live-datagrid`). ALLOWED and BLOCKED are
disjoint. It creates NO component: `realComponentCreated`, `reactComponentCreated`,
`jsxCreated`, `tsxCreated` are all `false`.
