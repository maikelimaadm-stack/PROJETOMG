import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function usePreview() {
  const { state, actions, services } = useStudioDomain();
  return {
    preview: state.preview,
    compile: actions.preview.compile,
    setStatus: actions.preview.setStatus,
    service: services.previewService,
  };
}

export default usePreview;
