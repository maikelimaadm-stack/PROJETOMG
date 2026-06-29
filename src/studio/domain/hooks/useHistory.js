import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useHistory() {
  const { state, actions } = useStudioDomain();
  return {
    history: state.history,
    undo: actions.history.undo,
    redo: actions.history.redo,
    sync: actions.history.syncFromSdk,
  };
}

export default useHistory;
