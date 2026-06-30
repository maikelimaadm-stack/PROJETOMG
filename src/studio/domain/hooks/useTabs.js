import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useTabs() {
  const { state, actions } = useStudioDomain();
  return {
    tabs: state.tabs,
    setTab: actions.tabs.setTab,
  };
}

export default useTabs;
