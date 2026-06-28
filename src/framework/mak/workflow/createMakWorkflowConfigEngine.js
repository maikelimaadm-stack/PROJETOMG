/**
 * Workflow Configuration Engine — integração natural ao ModeloBase1.
 */
import { buildMakWorkflowConfigMetadata } from "./buildMakWorkflowConfigMetadata.js";
import { runMakWorkflowExecution } from "./runMakWorkflowExecution.js";
import { MAK_WORKFLOW_STEP_TYPES } from "./makWorkflowBuiltinSteps.js";

export function createMakWorkflowConfigEngine(moduleId, options = {}) {
  const { workflowDefinitions = [], workflows = null } = options;
  const metadata = buildMakWorkflowConfigMetadata({ moduleId, workflowDefinitions, workflows });

  const execute = (params) =>
    runMakWorkflowExecution({
      moduleId,
      workflowDefinitions: metadata.workflowDefinitions,
      ...params,
    });

  const run = (workflowId, trigger = "start", context = {}, opts = {}) =>
    execute({ workflowId, trigger, context, options: opts });

  const hasWorkflows = () => metadata.workflowDefinitionCount > 0;

  return Object.freeze({
    moduleId,
    metadata,
    supportedStepTypes: MAK_WORKFLOW_STEP_TYPES,
    execute,
    run,
    hasWorkflows,
  });
}

export default createMakWorkflowConfigEngine;
