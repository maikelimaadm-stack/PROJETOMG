# QUALITY & SCALABILITY NOTES — ModeloBase1 Direct Beta

## Qualidade

- **Puro e determinístico.** Todo o módulo `src/runtime/modelobase1-direct-beta/` é JS puro (sem JSX, sem React), importável por `node --test`. O descritor estático e o modelo resolvido são deep-equal entre chamadas (sem contadores, sem relógios, IDs estáveis).
- **Cópias seguras.** `resolve()` aplica o padrão `finalize`: `safeClone` (JSON round-trip) do modelo plano e **reattach** do write guard vivo (cuja função `attempt` é descartada pelo clone). Mutar um resultado nunca afeta o estado interno.
- **Segurança de payload.** Poluição de protótipo é bloqueada na borda das opções (fábrica genérica) e no payload de escrita (`validateProjectionInput`). Dados sensíveis são mascarados (`redactSensitive`) na origem (view models e diagnostics de dataset).
- **Fail-closed.** As flags exigem `'true'` **e** ambiente não-produção; em produção falham fechadas salvo `*_ALLOW_PROD` explícito. Umbrella respeita o mesmo contrato.
- **Read-only garantido.** Nenhum caminho de escrita. Empresas reutiliza o write guard read-only existente (11 operações, códigos EMP-READONLY-003); Campos usa o write guard genérico (MB1-BETA-003). Testes cobrem `create/update/delete/save/submit/executeAction/startWorkflow/invokeConnector`.
- **36 testes** + **19 checks de gate**, incluindo escopo autorizado e paths proibidos.

## Escalabilidade

- **Fábrica genérica reutilizável.** `createModeloBase1DirectBetaReadModel({ moduleId, moduleName, enabled, source, writeGuard, resolveViewModel })` serve qualquer módulo. Adicionar uma 3ª tela beta = 1 wrapper + 1 flag, sem tocar o motor.
- **Ponto de injeção desacoplado.** `src/ModeloBase1/config/modeloBase1RuntimeReadModel.js` **não importa** o runtime — o ModeloBase1 permanece agnóstico. O read model é criado na config do módulo (que importa o runtime). O engine ganha um seam passivo sem acoplamento reverso.
- **No-op quando ausente.** O builder só anexa `runtimeReadModel` quando há modelo → nenhum outro módulo é afetado; fallback byte-idêntico.
- **Resolve assíncrono/lazy.** O descritor é síncrono (adequado a uma const de config em tempo de import); a materialização do view model é `resolve()` assíncrono, pronto para a Fase 2 (ModeloBase1 Runtime Wiring) consumir sob demanda.

## Dívidas / próximos passos

- **Fase 2 — ModeloBase1 Runtime Wiring:** fazer o engine consumir `config.runtimeReadModel` (render read da tabela/form via runtime v2) atrás da mesma flag. Hoje o slot é passivo (injetado, inspecionável, não renderizado) — o que garante fallback seguro nesta fase.
- **cadcps sem descritor runtime v2:** o view model de Campos vem direto do controlled dataset. Quando existir um descritor table/form de cadcps (como o de Empresas), trocar a fonte estrutural mantendo o mesmo wrapper.
- **Warning conhecido (vocabulário de colunas):** header do ModeloBase1 usa colunas do descritor; linhas controladas carregam colunas do dataset — drift de vocabulário de dev-preview já mapeado nos slices anteriores; não bloqueia (read-only, dados mock).
