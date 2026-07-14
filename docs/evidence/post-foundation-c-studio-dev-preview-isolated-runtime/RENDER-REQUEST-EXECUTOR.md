# Render Request Executor

`createIsolatedRuntimeRenderRequestExecutor(...)` ALWAYS blocks the real render and reports a
virtual frame instead: `renderAllowed: false`, `virtualFrameProduced: true`, `realRenderProduced:
false`, reason `UI runtime requires future explicit slice`. No React element / DOM / CSS produced.
