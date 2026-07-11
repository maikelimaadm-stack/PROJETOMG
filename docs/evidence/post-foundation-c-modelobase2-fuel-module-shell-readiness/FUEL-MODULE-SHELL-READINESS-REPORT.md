# Fuel Module Shell Readiness — Report

## Objetivo

Preparar o combustível (fuel/abastecimento) para virar um **módulo real futuramente**,
formalizando a camada de *module shell readiness* sobre o runtime operacional ModeloBase2 —
**sem registrar módulo, rota ou menu real**, e sem qualquer efeito colateral
(backend/Prisma/fetch/runtimeBridge/persistência real).

## Module Shell Readiness

`createModeloBase2FuelModuleShellReadiness({ env })` compõe, em um único descritor plano e
imutável (cópia segura via `safeCloneGenericModel`):

- **moduleContract** — contrato do módulo futuro (capabilities/commands/events/ui/route/menu/
  permissions/persistence/safety)
- **metadata** — identidade mínima do módulo (`Combustível`, categoria `Operacional`, status
  `beta_shell_readiness`)
- **routePlan** — plano de rota (`/operacional/combustivel`), **não** registrada
- **menuPlan** — plano de menu (Operacional / Combustível), **não** registrado
- **permissionPlan** — permissões planejadas, fail-closed, sem alterar auth global
- **persistenceBoundary** — `memory_validation`, sem persistência real
- **uiComposition** — reutiliza `ModeloBase2FuelSandboxShell`, não montado
- **diagnostics** — readiness `ready_for_beta_shell` quando habilitado
- **fallback** — passivo, registra/toca nada

Invariantes de topo: `moduleRegistered:false`, `routeRegistered:false`, `menuRegistered:false`,
`backendRegistered:false`, `localOnly:true`, `sent:false`, `persistenceReal:false`.

## Por que ainda NÃO é módulo real

- Não há registro de módulo em `src/modules`.
- Não há rota produtiva registrada em `src/App.jsx` (App.jsx intocado).
- Não há entrada de menu.
- Não há integração com auth/permissões globais.
- Não há decisão de persistência real / sync / backend.
- A única superfície visível permanece a rota dev-only `/__dev/modelobase2/fuel` (slice anterior).

## O que está pronto

- Contrato, metadata, planos (rota/menu/permissão), persistence boundary e UI composition.
- Reuso do shell React e do read model headless sem alterá-los.
- Diagnostics + fallback passivos.
- 48 testes + gate de 42 checks.

## O que falta (para produção)

- Decisão de persistência (backend controlado vs. local opt-in vs. sync).
- Integração de permissões com o modelo de auth global.
- Registro de rota produtiva (exigirá alteração de App.jsx no futuro).
- Registro de menu.
- Definição do local do módulo real.
- Política de sync/backend.

## Próximo passo recomendado

**Fuel Controlled Module Registration** ou **Fuel Beta Module Shell Candidate** — nunca backend write.
