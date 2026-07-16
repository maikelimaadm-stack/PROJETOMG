# Legacy Studio Prototype Exposure Debt — Not Touched

The debt regarding the **old Studio prototype** (`src/studio/components|shell|designers|pages|
navigation|dock|panels|editor/`) and its historic exposure remains **registered but intentionally NOT
corrected** in this slice.

This plan:

- imports/relinks/copies/moves NONE of the old prototype paths (asserted by static import scans and by
  the prototype-relink static-assertion plan);
- plans a fresh, headless authoring runtime with no dependency on the prototype;
- does not attempt to fix, migrate, or re-expose the prototype.

Resolving the legacy prototype exposure debt is out of scope here and must be handled by a dedicated,
separately-approved slice.
