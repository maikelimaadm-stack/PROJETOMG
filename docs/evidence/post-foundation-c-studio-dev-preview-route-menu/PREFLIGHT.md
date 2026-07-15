# Preflight — `createRouteMenuPreflight`

Runs the ordered precondition checks before any mount can be authorized:

1. upstream route/menu contract present and well-formed;
2. runtime UI present;
3. synthetic-data-only virtual frame;
4. flag enabled;
5. environment is `development`;
6. checkpoint receipt equals `approved_for_isolated_route_menu_runtime`.

Any failing check short-circuits to `preflightPassed: false` with a specific reason
code. Preflight is pure and deterministic and performs no mounting — it only reports
whether the downstream gate/guard/mount pipeline may proceed.
