# Legacy Studio Prototype Exposure Debt — Not Touched

The debt regarding the **old Studio prototype** (`src/studio/components|shell|designers|pages|
navigation|dock|panels|editor/`) and its historic exposure remains **registered but intentionally NOT
corrected** in this slice.

The runtime imports/relinks/copies/moves NONE of the old prototype paths (asserted by static import
scans and the invariant enforcer) and builds fresh, headless logic with no dependency on the prototype.
Resolving the legacy prototype exposure debt is out of scope and requires a dedicated, separately-
approved slice.
