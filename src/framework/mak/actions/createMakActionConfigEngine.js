/**
 * Actions Configuration Engine — integração natural ao ModeloBase1.
 */
import { buildMakActionConfigMetadata } from "./buildMakActionConfigMetadata.js";
import { runMakActionExecution } from "./runMakActionExecution.js";
import { MAK_ACTION_TYPE_NAMES } from "./makActionBuiltinTypes.js";

export function createMakActionConfigEngine(moduleId, options = {}) {
  const { actionDefinitions = [], actions = null } = options;
  const metadata = buildMakActionConfigMetadata({ moduleId, actionDefinitions, actions });

  const execute = (params) =>
    runMakActionExecution({
      moduleId,
      actionDefinitions: metadata.actionDefinitions,
      ...params,
    });

  const run = (actionId, context = {}, opts = {}) =>
    execute({ actionId, context, options: opts });

  const hasActions = () => metadata.actionDefinitionCount > 0;

  return Object.freeze({
    moduleId,
    metadata,
    supportedActionTypes: MAK_ACTION_TYPE_NAMES,
    execute,
    run,
    hasActions,
  });
}

export default createMakActionConfigEngine;
