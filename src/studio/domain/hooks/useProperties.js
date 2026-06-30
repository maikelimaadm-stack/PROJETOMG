import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useProperties() {
  const { state, actions } = useStudioDomain();
  return {
    properties: state.properties,
    setFields: actions.properties.setFields,
    updateField: actions.properties.updateField,
  };
}

export default useProperties;
