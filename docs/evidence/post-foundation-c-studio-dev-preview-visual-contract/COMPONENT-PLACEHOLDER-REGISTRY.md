# Component Placeholder Registry

`createDevPreviewVisualComponentPlaceholderRegistry()` declares the 19 ALLOWED visual
placeholder kinds (VisualContainerPlaceholder … VisualErrorStatePlaceholder) as plain contract
tokens — each has a name + intent, and NEVER a real component: `isRealComponent`,
`importsComponent`, `referencesComponentPath`, `jsx`, `tsx` are all `false`.

It also enumerates the 15 permanently BLOCKED kinds (ReactComponent, JsxElement, TsxElement,
DomNode, RealInput, LiveDataGrid, RouterOutlet, RouteLink, MenuItem, NavBar, Iframe, ScriptTag,
StylesheetLink, FetchWidget, MutationButton). ALLOWED and BLOCKED are disjoint. `isAllowedVisualPlaceholderKind`
returns false for any blocked or unknown kind.
