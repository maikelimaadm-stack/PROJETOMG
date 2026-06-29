import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useSearch() {
  const { state, actions, services } = useStudioDomain();
  return {
    search: state.search,
    setQuery: actions.search.setQuery,
    runSearch: actions.search.runSearch,
    setOpen: actions.search.setOpen,
    service: services.searchService,
  };
}

export default useSearch;
