import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useClipboard() {
  const { state, actions } = useStudioDomain();
  return {
    clipboard: state.clipboard,
    copy: actions.clipboard.copy,
    clear: actions.clipboard.clear,
  };
}

export default useClipboard;
