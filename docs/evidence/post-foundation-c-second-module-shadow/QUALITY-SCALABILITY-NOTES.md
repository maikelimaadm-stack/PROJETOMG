# QUALITY & SCALABILITY NOTES — SECOND MODULE SHADOW / GENERIC MODULE RUNTIME

## Objetivo

Explicar a generalização da arquitetura de shadow/projeção de Empresas numa base module-agnostic, e sua validação num segundo módulo real (`cadcps`), mantendo tudo passivo, opt-in, sem dados reais e sem alterar produção.

## Módulo escolhido

- **nome:** `cadcps` (CadCpsCampo — "Cadastro de Campos").
- **motivo:** cadastro real, simples e de baixo risco, com estrutura de table/form detectável (`CPS_COLUNAS_BASE`, `CPS_REQUIRED_FIELDS`), espelhando a estrutura de Empresas.
- **risco:** baixo — sem fluxo operacional crítico, sem integração externa obrigatória, e este slice não toca a tela real nem executa CRUD.
- **limitações:** usa um descriptor estático (não os field defs vivos), sem dados reais, sem preview visual montado.

## Escalabilidade

- **Custo do descriptor:** O(campos + colunas) para validar/normalizar (`validateGenericModuleDescriptor`/`normalizeGenericModuleDescriptor`), mais mascaramento O(chaves de meta) e uma varredura O(nós) para garantir ausência de funções.
- **Custo do shadow pass (pilot):** O(campos) para snapshot legado + v2, mais O(chaves) da comparação via `RuntimeShadowMode` + `runShadowPass` (readiness O(24)).
- **Custo da projeção table/form:** O(colunas + campos), mais O(campos com permissão) chamadas `permissionEngine.can` quando M09 é injetado.
- **Custo da comparação:** delega à `compareWithLegacy` do RuntimeShadowMode — limitado pelos tetos herdados.
- **Impacto com a flag DESLIGADA:** zero — `run()` retorna imediatamente sem construir projeção. Seguro para embarcar desligado.
- **Impacto com a flag LIGADA:** o custo de duas projeções estruturais pequenas + comparação, por módulo, fora do caminho de render.

## Segurança / Fail-safe

- **Opt-in:** flags off por padrão (`MAK_RUNTIME_V2_SECOND_MODULE_SHADOW` genérica; `MAK_RUNTIME_V2_SHADOW_CADCPS` para o cadcps).
- **Falha isolada:** falha do shadow/comparação capturada em `{ ok: false, error }`; nunca propagada.
- **Sem dados reais:** descriptor estático; nenhum registro real de cadcps; nenhum banco/backend/Prisma/fetch.
- **Sem side effects:** nunca executa salvar/editar/excluir nem action/workflow/connector — apenas metadados.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`. Verificado por teste e gate.
- **Sem persistência:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`.
- **Dados sensíveis mascarados:** `meta` do descriptor mascarado.
- **Descriptor puro:** `validateGenericModuleDescriptor` rejeita qualquer função no descriptor — descriptors são metadados, nunca comportamento.
- **Poluição de protótipo bloqueada:** `__proto__`/`constructor`/`prototype` em qualquer nível lançam `MAK-L3-GENERIC-SHADOW-001`.

## Determinismo

- **Mesmo descriptor gera mesma projeção:** projeções/snapshots ordenam colunas e campos por id; `deepEqual` para a mesma entrada; clock injetável.
- **Diagnostics são cópias seguras:** `getDiagnostics()` retorna clones profundos.
- **Runtime legado não é alterado:** a base apenas modela estruturalmente; nunca toca o bridge.
- **UI real não é alterada:** nenhuma rota/menu; nenhum import de `src/modules`.

## Genericidade

- **Extraído de Empresas:** o algoritmo do shadow pilot, o algoritmo da projeção table/form, os guards (poluição/mascaramento/clone), a canonicalização de tipos v2 e a comparação — tudo agora parametrizado por `GenericModuleDescriptor`.
- **Continua específico do módulo:** o descriptor estático e o nome da flag opt-in.
- **Como um terceiro módulo entra depois:** fornecer um `createXDescriptor()` estático + uma flag, e montar `createGenericModuleShadowPilot`/`createGenericModuleTableFormShadow` com esse descriptor — sem tocar na base. Provado pelo teste que roda cadcps E um descriptor `setores` pela mesma classe.

## Débitos técnicos controlados

- **Ainda não substitui telas reais:** as UIs continuam servidas pelo runtime legado.
- **Ainda não usa dados reais:** apenas descriptors estáticos.
- **Ainda não executa ações reais:** nenhum CRUD/action/workflow/connector.
- **Ainda não cria Studio:** nada do Studio é tocado.
- **Migration planning fica para próximo slice:** expor previews num harness/rota dev controlada, ou planejar a migração de um módulo piloto, é o próximo passo.

## Conclusão

A base genérica de shadow/projeção e o segundo módulo (cadcps) estão aptos para merge do ponto de vista de qualidade: arquitetura reutilizável comprovada em dois módulos (Empresas via referência + cadcps + descriptor de teste), opt-in e passiva, determinística, sem dados reais, sem side effect/salvar-editar-excluir/action-workflow-connector, com descriptors puros (sem funções), dados sensíveis mascarados, poluição de protótipo bloqueada, e runtime legado / UI de produção / `src/App.jsx` / menu / Foundation C completamente preservados, sem dependência nova, sem CSS global novo, e sem qualquer dependência de Prisma/backend/MMM direto.
