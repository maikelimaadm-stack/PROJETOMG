import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useWorkspace() {
  const { state, actions } = useStudioDomain();
  return {
    workspace: state.workspace,
    setModule: actions.workspace.setModule,
    setDesigner: actions.workspace.setDesigner,
    setExplorerTree: actions.workspace.setExplorerTree,
    setDesignerLabel: actions.workspace.setDesignerLabel,
  };
}

export default useWorkspace;
