# QUALITY & SCALABILITY NOTES — RUNTIME V2 DEV PREVIEW HUB

## Objetivo

Explicar o hub dev-only que agrega os previews runtime v2 (Empresas + cadcps) para inspeção visual interna em desenvolvimento, sem dados reais, sem rota pública e sem alterar produção.

## Módulos incluídos

- **Empresas** — pipeline específico já existente.
- **cadcps** — pipeline genérico do segundo módulo.

## Escalabilidade

- **Custo de criação do hub model:** O(módulos × (colunas + campos)) — constrói uma fixture por módulo e deriva summaries; uma cópia profunda final garante isolamento. Sem I/O, sem rede.
- **Custo por módulo no hub:** dominado pela construção da fixture (projeção estrutural pequena) + a derivação do view model.
- **Custo de renderização dos previews:** O(colunas + campos + diagnósticos) por card — listas estruturais pequenas.
- **Custo de diagnostics:** O(módulos) para agregar warnings/contagens.
- **Impacto com a flag DESLIGADA:** zero — `RuntimeV2DevPreviewHub` renderiza `null`; nada é construído nem montado. Em produção, falha fechada por padrão.
- **Impacto em dev com a flag LIGADA:** o custo de construir duas fixtures mock e renderizar dois cards, num harness dev isolado.
- **Limites conhecidos:** o hub começa com 2 módulos (fixos); adicionar um terceiro é O(1) na estrutura (mais uma fixture).

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; `MAK_RUNTIME_V2_DEV_PREVIEW_HUB` só liga quando exatamente `'true'`.
- **Dev-only:** requer ambiente não-produção; em produção **falha fechado** salvo o override explícito e documentado `MAK_RUNTIME_V2_DEV_PREVIEW_HUB_ALLOW_PROD === 'true'`.
- **Produção falha fechada:** ver acima.
- **Sem dados reais:** só fixtures mock; `status.mocked = true`; metadata marcada `source: 'mock-fixture'`.
- **Sem side effects:** nunca executa salvar/editar/excluir nem action/workflow/connector — apenas texto metadata.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`. Verificado por teste e gate.
- **Sem persistência:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`.
- **Dados sensíveis mascarados:** metadata mascarada (`apiKey → [REDACTED]`) por módulo.
- **Falha isolada por módulo:** uma falha ao construir a fixture de um módulo é capturada em `{ ok: false, error }` naquele módulo — o hub nunca quebra.
- **Poluição de protótipo bloqueada:** options com `__proto__` lançam `MAK-L3-DEV-HUB-001`.
- **Sem rota/menu:** hub exportável sem auto-mount; `src/App.jsx` intocado.
- **React fora do core:** os `.jsx` do hub não são exportados pelo barrel — o core do runtime permanece framework-free.

## Determinismo

- **Mesmo fixture gera mesmo hub model:** as fixtures são determinísticas e o model não inclui timestamps; `deepEqual` para a mesma entrada.
- **Cópia segura:** o hub model é uma cópia profunda; mutar o retorno nunca afeta uma nova build.
- **Runtime legado não é alterado:** o hub apenas agrega fixtures mock.
- **UI real não é alterada:** nenhuma rota/menu; nenhum import de `src/modules`.

## Genericidade

- **Empresas usa pipeline específico já existente** (`createEmpresasDevPreviewFixture`).
- **cadcps usa pipeline genérico** (`createSecondModuleDevPreviewFixture`, sobre a base module-agnostic).
- **O hub mostra que os dois podem conviver:** cada card reporta seu `source`; um terceiro módulo entra fornecendo sua fixture ao builder.

## Débitos técnicos controlados

- **Ainda não substitui tela real:** as UIs continuam servidas pelo runtime legado.
- **Ainda não usa dados reais:** só fixtures mock.
- **Ainda não executa ações reais:** nenhum CRUD/action/workflow/connector.
- **Ainda não cria Studio:** nada do Studio é tocado.
- **Migration planning fica para próximo slice:** planejar a migração de um módulo piloto, ou um dataset dev controlado maior, é o próximo passo.

## Conclusão

O hub dev-only de previews runtime v2 está apto para merge do ponto de vista de qualidade: componentes React exportáveis (sem rota/menu/auto-mount) que agregam os previews de Empresas (pipeline específico) e cadcps (pipeline genérico) a partir de um hub model puro, determinístico e mockado, opt-in e fail-closed em produção, sem dados reais, sem side effect/salvar-editar-excluir/action-workflow-connector, com falha isolada por módulo, dados sensíveis mascarados, core testável separado dos `.jsx`, nenhum React no barrel do runtime, e runtime legado / UI de produção / `src/App.jsx` / menu / Foundation C completamente preservados, sem dependência nova, sem CSS global novo, e sem qualquer dependência de Prisma/backend/MMM direto.
