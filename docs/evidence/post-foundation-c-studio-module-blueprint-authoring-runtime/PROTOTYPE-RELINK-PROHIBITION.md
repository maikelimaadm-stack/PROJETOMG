# Prototype Relink Prohibition

The runtime imports/relinks/copies/moves NONE of the old Studio prototype paths
(`src/studio/components|shell|designers|pages|navigation|dock|panels|editor/`), asserted by static
import scans in the test and gate, and by the invariant enforcer's `no_old_prototype_references` rule.

The legacy prototype exposure debt remains registered but is intentionally NOT touched in this slice.
