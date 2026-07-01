export function explainOptimizationLoop(loop) {
  if (!loop) return null;
  return Object.freeze({
    loopId: loop.loopId,
    title: loop.title,
    because: "Loop de otimização preparado a partir de melhorias anteriores — decisão final é humana.",
    frictionScore: loop.frictionScore ?? 0,
    requiresHumanApproval: true,
    autonomousExecutionForbidden: true,
    explainable: true,
  });
}

export default explainOptimizationLoop;
