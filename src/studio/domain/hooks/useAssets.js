import { useStudioDomain } from "../providers/StudioDomainProvider.jsx";

export function useAssets() {
  const { state, actions, services } = useStudioDomain();
  return {
    assets: state.assets,
    load: actions.assets.load,
    service: services.assetService,
  };
}

export default useAssets;
