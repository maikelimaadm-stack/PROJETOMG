import { userPreferencesApi } from "@/apis/preferences/userPreferencesApi";
import { queryClientInstance } from "@/shared/contexts/queryClient";
import { dispatchEmpPreferencesBootstrapApplied } from "@/modules/empresas/preferences/empresasPreferencesBootstrapEvents";
import { empresasPreferencesBootstrapQueryKey } from "@/modules/empresas/preferences/empresasPreferencesQueryKeys";
import {
  EMPRESAS_FORM_SCOPE,
  EMPRESAS_LISTAGEM_SCOPE,
  applyFormLayoutPreferencesToStorage,
  applyListagemPreferencesToStorage,
  applyRemoteListagemPreferencesToStorage,
  hasScopedListagemPreferences,
  mapBootstrapPreferences,
} from "@/modules/empresas/preferences/empresasPreferencesStorage";

const LISTAGEM_SCOPE_KEY = `${EMPRESAS_LISTAGEM_SCOPE.modulo}.${EMPRESAS_LISTAGEM_SCOPE.tela}`;
const FORM_SCOPE_KEY = `${EMPRESAS_FORM_SCOPE.modulo}.${EMPRESAS_FORM_SCOPE.tela}`;

/** Prefetch + hidrata preferências no login para Empresas já abrir configurado. */
export async function prefetchEmpresasPreferencesAtLogin(clienteId, userId) {
  if (!clienteId || !userId) return { hydrated: false };

  const queryKey = empresasPreferencesBootstrapQueryKey(clienteId, userId);
  try {
    const payload = await queryClientInstance.fetchQuery({
      queryKey,
      queryFn: () => userPreferencesApi.bootstrap(),
      staleTime: 10 * 60_000,
    });

    const mapped = mapBootstrapPreferences(payload);
    const hasLocal = hasScopedListagemPreferences();
    let visualChange = false;

    const listagemRecord = mapped[LISTAGEM_SCOPE_KEY];
    if (listagemRecord?.preferencias) {
      if (hasLocal) {
        visualChange =
          applyRemoteListagemPreferencesToStorage(listagemRecord.preferencias) || visualChange;
      } else {
        visualChange =
          applyListagemPreferencesToStorage(listagemRecord.preferencias, {
            reason: "listagem:hydrate",
          }) || visualChange;
      }
    }

    const formRecord = mapped[FORM_SCOPE_KEY];
    if (formRecord?.preferencias) {
      applyFormLayoutPreferencesToStorage(
        userId,
        formRecord.preferencias,
        formRecord.updatedAt,
        clienteId,
        formRecord.revision
      );
    }

    dispatchEmpPreferencesBootstrapApplied({
      generation: 1,
      status: hasLocal ? "local_applied" : "remote_applied",
      hadLocalSnapshot: hasLocal,
      clienteId,
      userId,
    });

    return { hydrated: true, hasLocal, visualChange };
  } catch {
    return { hydrated: false };
  }
}
