import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function usePublish() {
  const { state, actions, services } = useStudioDomain();
  return {
    publish: state.publish,
    validate: actions.publish.validate,
    publishDraft: actions.publish.publish,
    service: services.publishService,
  };
}

export default usePublish;
