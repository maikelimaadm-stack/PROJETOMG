import { useMakPreferencesBootstrapState } from "@/framework/mak/preferences/PreferencesBootstrapProvider.jsx";
import { useModeloBase1Config } from "@/ModeloBase1/config/ModeloBase1Context.jsx";

export function useModeloBase1PreferencesBootstrap() {
  const config = useModeloBase1Config();
  const bootstrapState = useMakPreferencesBootstrapState();
  const moduleId = config.moduleId;
  const moduleBootstrap = bootstrapState.modules?.[moduleId];
  if (moduleBootstrap) return moduleBootstrap;
  if (bootstrapState.primary) return bootstrapState.primary;
  return bootstrapState;
}

export default useModeloBase1PreferencesBootstrap;
