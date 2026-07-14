# Virtual Frame Mapping

`createRuntimeUiVirtualFrameMapping({ isolatedRuntime })` copies the isolated runtime's virtual
preview frame metadata (frameId, digests, screenKind, sections, slots, placeholders, synthetic
rows/fields, blocked actions, permission hints, state) into a stable mapping. It builds NO React
element, NO DOM, NO CSS (`reactElement/domNode/cssRuntime: false`).
