import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useSelection() {
  const { state, actions } = useStudioDomain();
  return {
    selection: state.selection,
    selectEntry: actions.selection.selectEntry,
    clearSelection: actions.selection.clear,
  };
}

export default useSelection;
