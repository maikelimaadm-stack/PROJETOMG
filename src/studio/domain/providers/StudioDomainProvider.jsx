import { createContext, useContext, useEffect, useMemo, useSyncExternalStore } from "react";
import { createStudioDomainStore } from "../state/createStudioDomainStore.js";
import { createDomainActions } from "../state/createDomainActions.js";
import { createInitialStudioDomainState } from "../contracts/studioDomainContracts.js";
import { createMockDomainServiceAdapters } from "../adapters/createMockDomainServiceAdapters.js";

const StudioDomainContext = createContext(null);

/**
 * Official Studio Domain Provider — single shared domain root.
 */
export function StudioDomainProvider({
  children,
  initialState,
  services,
  hub,
  sdk,
}) {
  const store = useMemo(() => createStudioDomainStore(initialState ?? createInitialStudioDomainState()), []);

  const serviceAdapters = useMemo(
    () => services ?? createMockDomainServiceAdapters(),
    [services]
  );

  const actions = useMemo(
    () => createDomainActions(store, { hub, sdk, services: serviceAdapters }),
    [store, hub, sdk, serviceAdapters]
  );

  const state = useSyncExternalStore(
    (cb) => store.subscribe(cb),
    () => store.getState(),
    () => store.getState()
  );

  useEffect(() => {
    if (!sdk?.history) return undefined;
    const sync = () => actions.history.syncFromSdk();
    sync();
    return sdk.history.subscribe?.(sync) ?? undefined;
  }, [sdk?.history, actions.history]);

  const value = useMemo(
    () => ({
      store,
      state,
      actions,
      services: serviceAdapters,
      hub,
      sdk,
    }),
    [store, state, actions, serviceAdapters, hub, sdk]
  );

  return <StudioDomainContext.Provider value={value}>{children}</StudioDomainContext.Provider>;
}

export function useStudioDomain() {
  const ctx = useContext(StudioDomainContext);
  if (!ctx) throw new Error("useStudioDomain must be used within StudioDomainProvider");
  return ctx;
}

export default StudioDomainProvider;
