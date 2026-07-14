# Accessibility Projection Contract

`createRuntimeUiAccessibilityProjectionContract()` describes accessibility intentions (labels
required, aria metadata, keyboard plan, focus order, blocked-interaction announcements) as
metadata. It touches NO DOM and sets no real aria attribute (`domTouched/setsRealAria: false`).
