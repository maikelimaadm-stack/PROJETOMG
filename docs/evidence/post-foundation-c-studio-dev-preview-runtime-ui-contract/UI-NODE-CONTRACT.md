# UI Node Contract

`createRuntimeUiNodeContract({ frameMapping })` builds a metadata-only logical tree of UI nodes.
Each node has `nodeId`, `nodeKind`, `nodeRole`, `sourcePlaceholderId`, `sourceSectionId`,
`sourceSlotId`, `children`, `propsMetadata`, `stateMetadata`, `permissionMetadata`. It creates NO
React element, NO JSX, NO DOM node, NO required real CSS class, NO real handler
(`reactElement/jsx/domNode/requiredRealCssClass/realHandler: false`).
