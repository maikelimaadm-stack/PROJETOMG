# Accessibility Contract

`createDevPreviewVisualAccessibilityContract()` describes accessibility intentions: labels
required, aria metadata placeholders, a keyboard plan, focus order, and blocked-interaction
announcements — all metadata. It touches NO DOM and sets no real aria attribute: `domTouched`
and `setsRealAria` are `false`.
