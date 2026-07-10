# ACCELERATED BETA PLAN — modeloBase1 Empresas / Campos

## Objetivo

Encurtar o caminho para uma tela **beta funcional** de Empresas (e depois Campos Personalizados) alimentada por runtime v2, aproveitando que ambas **já rodam sobre o ModeloBase1**. Alterar diretamente Empresas + Campos + modeloBase1 como **beta controlado**, limitado por escopo, reversível por flag, testado, sem afetar backend/Prisma/runtime global/outras telas.

## Premissa

Cadastro de Empresa, Campos Personalizados e modeloBase1 **ainda não são produção crítica real** — são beta/experimental. Alteração direta controlada é permitida no próximo slice.

## Caminho antigo (hiperconservador)

```
read slot candidate → dev activation → read slot real → bridge → overlay → tela real
```
Custo: ~5–6 slices dev-only sem entregar tela beta funcional.

## Caminho novo recomendado (Accelerated Beta Direct Activation)

```
flag beta no ModeloBase1 de Empresas
  → runtime v2 (view model read-only + controlled dataset) alimenta a leitura beta
  → fallback para a config atual quando flag off
  → depois: Campos no mesmo padrão
  → depois: write local/controlado
  → depois: persistência
  → depois: consolidação
```
Custo: **1 slice** para a primeira tela beta read-only funcional.

## Escopo permitido (próximos slices)

- `src/modules/empresas/**`, `src/modules/cadcps/**`
- `src/ModeloBase1/**` (ponto de injeção da leitura beta, com gate forte)
- `src/runtime/**` relacionado (view model read-only, dataset, adaptador ModeloBase1↔runtime v2)
- `src/App.jsx` — apenas flag/rota beta mínima
- gates relacionados ao escopo

## Escopo proibido (continua Risco Alto)

- backend, APIs, Prisma, schema
- `src/framework/**` compartilhado (incl. `framework/cadastro/*`), salvo ponto de injeção explícito e isolado
- `src/modules/makBootstrap/runtimeBridge/**`, makBootstrap global, runtime legado global
- SSOT, Studio, Marketplace, BOS, outras telas de módulos
- CSS global, auth/permissões globais, remoção de runtime legado global

## Fases sugeridas

### Fase 1 — Direct Beta Activation
Feature flag `MAK_MODELOBASE1_EMPRESAS_BETA` (off por padrão, fail-closed em produção). Um adaptador dev/beta que injeta o **view model read-only do runtime v2** (Empresas Read-Only Candidate + controlled dataset) na leitura do ModeloBase1 de Empresas, atrás da flag. Flag off → config/leitura atuais intactas (fallback). Read-only: sem write.

### Fase 2 — modeloBase1 Runtime Wiring
Formalizar o ponto de injeção no ModeloBase1 (`buildModeloBase1ConfigFromMakModule` ganha um hook opcional `runtimeReadModel`), reutilizável por qualquer módulo. Empresas passa a poder ler via runtime v2 quando a flag liga.

### Fase 3 — Empresas + Campos Unified Config
Aplicar o mesmo wiring a Campos Personalizados (cadcps) — mesma flag-família ou flag por módulo. Empresas e Campos leem via runtime v2 sobre o mesmo ModeloBase1.

### Fase 4 — Controlled Local Write
Introduzir write **local/controlado** (em memória/estado, não backend), atrás de flag e write guard explícito e testado. Ainda sem persistência real.

### Fase 5 — Persistence Validation
Validar persistência controlada (ainda beta): comparar o que o runtime v2 escreveria com o que o legado escreve, sem alterar Prisma/schema; write real só depois de gate+rollback provados.

### Fase 6 — Production Hardening
Endurecer: paridade completa, performance com dados reais, rollback, permissões — só então consolidar Empresas/Campos como módulo runtime v2 real.

## Gates sugeridos (próximo slice)

1. **Escopo autorizado** — só Empresas/cadcps/modeloBase1/runtime v2 relacionado.
2. **Backend/Prisma bloqueado** — nada de `src/apis`/prisma/schema.
3. **Outras telas bloqueadas** — nenhum módulo fora do escopo.
4. **Fallback** — flag off mantém comportamento anterior (verificável).
5. **Write** — se houver write, local/controlado + write guard + teste explícito.
6. **UI** — sem CSS global.
7. **Dados** — sem dados reais obrigatórios (controlled dataset roda o beta).
8. **Runtime** — runtimeBridge global preservado.
9. **modeloBase1** — Empresas e Campos conectam no mesmo ModeloBase1 (invariante).
10. **Testes** — `test:runtime` + testes específicos PASS.

## Fallback

Flag `MAK_MODELOBASE1_EMPRESAS_BETA` off → `PAGEMP`/`empresasModeloBase1Config` atuais, sem qualquer leitura runtime v2. Reversão = flag off (ou revert do PR). Sem schema/write destrutivo.

## Riscos e mitigação

| Risco | Mitigação |
|---|---|
| Regressão na tela real de Empresas | flag off por padrão + fallback + `test:runtime` + gate de escopo |
| Divergência estrutural legado×v2 | dual-read/hardening já surfaçam; resolver no wiring |
| Vazar mudança para framework/backend | gate de escopo + gate backend/Prisma bloqueado |
| Write acidental | write guard + fase 4 explícita e isolada |

## Conclusão

O caminho acelerado é viável e muito mais curto porque **Empresas e Campos já compartilham o ModeloBase1**. Recomenda-se **mudar do caminho hiperconservador para o beta direto**, congelar as camadas de ponte (dry run/read slot), reaproveitar as camadas essenciais (read-only candidate + dataset + shadow) como fonte da leitura beta, e ajustar os gates de "não tocar Empresas" para "escopo autorizado". Próximo slice: **MODELOBASE1 EMPRESAS/CAMPOS DIRECT BETA ACTIVATION** (Fase 1).
