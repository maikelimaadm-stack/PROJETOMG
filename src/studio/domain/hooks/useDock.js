import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useDock() {
  const { state, actions } = useStudioDomain();
  return {
    dock: state.dock,
    toggle: actions.dock.toggle,
    setVisibility: actions.dock.setVisibility,
  };
}

export default useDock;
