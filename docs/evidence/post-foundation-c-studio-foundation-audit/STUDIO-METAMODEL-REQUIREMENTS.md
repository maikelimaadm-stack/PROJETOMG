# Studio Metamodel Requirements

Requisitos do metamodel inicial. **Nenhum schema é implementado** — apenas requisitos conceituais.

| Entidade | Objetivo | Campos mínimos | Regras | 1º slice? |
|---|---|---|---|---|
| StudioProject | agrupa modelos/módulos | id, name, version, status | isolamento por projeto | sim (contrato) |
| StudioModel | modelo de dados abstrato | id, name, modelFamily, modelType, fields[] | modelType decide MB1/MB2 | sim |
| StudioModule | módulo configurável | id, moduleId, modelRef, screens, permissions | 1 módulo = 1 modelo primário | sim |
| StudioField | campo de um modelo | id, name, type, required, validation | sem type inválido | sim |
| StudioFieldType | catálogo de tipos | id, kind, constraints | allowlist de tipos | sim |
| StudioScreen | tela (tabela/form) | id, kind, layout, bindings | sem UI real ainda | pode esperar |
| StudioTable | config de tabela | columns, sort, filters, page | derivado de fields | pode esperar |
| StudioForm | config de formulário | sections, fields, validations | derivado de fields | pode esperar |
| StudioValidation | regra de validação | id, kind, target, params | fail-closed | sim |
| StudioRelationship | relação entre modelos | id, from, to, kind | sem ciclo não resolvido | pode esperar |
| StudioPermission | permissão planejada | id, action, scope | default-deny | sim |
| StudioRoutePlan | plano de rota | routePath, guard, flag, productionAllowed:false | nunca auto-registra | sim |
| StudioMenuPlan | plano de menu | label, group, visibility | nunca auto-registra | sim |
| StudioPersistenceBoundary | limite de persistência | state, allowed, blocked | sem Prisma/migration auto | sim |
| StudioRuntimeBinding | binding ao runtime | runtime, readModel, fallback | read-only primeiro | sim |
| StudioDiagnostics | diagnósticos | status, blockers, warnings | passivo | sim |
| StudioGatePlan | gates do módulo gerado | gateIds, scope | obrigatório antes de gerar | sim |
| StudioBlueprint | blueprint versionado | ver Module Blueprint | imutável por versão | sim |
| StudioVersion | versionamento semver | major/minor/patch | breaking = major | sim |

Cada entidade carrega: objetivo · campos mínimos · regras mínimas · status · relacionamentos ·
riscos · e se precisa existir já no primeiro implementation slice (contracts) ou pode esperar.
