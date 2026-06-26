/**
 * @deprecated Use useAppPreferencesBootstrap from @/modules/makBootstrap — Foundation não importa módulos.
 * Mantido como re-export para compatibilidade; delega via injeção no Provider.
 */
export function useMakPreferencesBootstrapAggregator(enabledModuleIds, userId, useBootstrapHook) {
  if (typeof useBootstrapHook !== "function") {
    throw new Error(
      "useMakPreferencesBootstrapAggregator: useBootstrapHook is required (inject from @/modules/makBootstrap)"
    );
  }
  return useBootstrapHook(enabledModuleIds, userId);
}
