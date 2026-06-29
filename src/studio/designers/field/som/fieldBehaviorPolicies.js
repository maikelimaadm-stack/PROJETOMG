/** Field-specific behavior policies — registered on SOM Behavior Engine */

export function registerFieldBehaviorPolicies(behaviorEngine) {
  behaviorEngine.registerTrigger({ id: "field.onLoad", event: "onLoad" });
  behaviorEngine.registerAction({ id: "field.setProperty", kind: "setProperty" });
  behaviorEngine.registerBehaviorPolicy({ id: "sequential", validate: () => [] });
}

export default registerFieldBehaviorPolicies;
