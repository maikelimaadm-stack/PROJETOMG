# App Route Scope Validation

## App.jsx alterado?

**Sim — somente** para a rota dev-only. Três adições (sem remover/alterar linhas existentes):

1. `import { shouldMountModeloBase2FuelDevPreviewRoute, MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH } from "@/ModeloBase2/fuel-ui-sandbox/dev-preview/modeloBase2FuelDevPreviewConfig.js";`
2. `const ModeloBase2FuelDevPreviewRoute = lazy(() => import("@/ModeloBase2/fuel-ui-sandbox/dev-preview/ModeloBase2FuelDevPreviewRoute.jsx"));`
3. Bloco `<Route>` guardado dentro de `<Routes>`:
   ```jsx
   {shouldMountModeloBase2FuelDevPreviewRoute() && (
     <Route path={MODELOBASE2_FUEL_DEV_PREVIEW_ROUTE_PATH}
       element={<Suspense fallback={<ModuleLoadingFallback />}><ModeloBase2FuelDevPreviewRoute /></Suspense>} />
   )}
   ```

## Menu alterado?

**Não.** Nenhuma entrada de menu/navegação adicionada. `menuRegistered` permanece `false`.

## Rotas produtivas alteradas?

**Não.** Nenhuma rota existente removida/modificada; apenas a rota dev-only guardada foi adicionada.

## Auth global alterado?

**Não.** Sem mudança em auth/permissões.

## Impacto

- A rota só monta em dev + flag on (fail-closed em produção). Lazy + guardada → não entra no bundle
  quando não montada.
- Validado por: gate deste slice (App.jsx-diff estrito), o guard compartilhado `productionUiGuard`
  (rota fuel dev como 2ª exceção sancionada), o master `gate:g423`, e o teste de ativação runtime-v2
  (agora aceita o path fuel dev).
