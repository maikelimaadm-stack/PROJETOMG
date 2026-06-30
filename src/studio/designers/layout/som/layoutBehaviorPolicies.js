/** Layout-specific behavior policies — registered on SOM Behavior Engine */

export function registerLayoutBehaviorPolicies(behaviorEngine) {
  behaviorEngine.registerTrigger({ id: "layout.onLoad", event: "onLoad" });
  behaviorEngine.registerTrigger({ id: "layout.onChange", event: "onChange" });
  behaviorEngine.registerAction({ id: "layout.setProperty", kind: "setProperty" });
  behaviorEngine.registerAction({ id: "layout.showMessage", kind: "showMessage" });

  behaviorEngine.registerBehaviorPolicy({
    id: "sequential",
    validate: () => [],
  });

  behaviorEngine.registerBehaviorPolicy({
    id: "parallel",
    validate: (behavior) => {
      if (behavior.actions.length > 4) {
        return ["Parallel policy supports at most 4 actions."];
      }
      return [];
    },
  });
}

export default registerLayoutBehaviorPolicies;
