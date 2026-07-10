# QUALITY & SCALABILITY NOTES — MODELOBASE1 RUNTIME WIRING

## Objetivo
Explicar o wiring real do `runtimeReadModel` no ModeloBase1 — o engine passa a **consumir** o read model runtime v2 (leitura beta read-only) atrás de flag, com fallback total.

## Escalabilidade
- **Custo do resolver:** O(1) — lê `config.runtimeReadModel` e normaliza. Sem alocação relevante.
- **Custo da validação:** descritor = O(campos) (checagem rasa + 11 tentativas no write guard, cada uma O(1)); payload = O(nós) limitado a profundidade 8. Determinístico.
- **Custo da aplicação de table/form:** `safeClone` (JSON round-trip) proporcional ao tamanho do payload mock (colunas + poucas linhas do controlled dataset) — pequeno e limitado.
- **Custo do fallback:** trivial (constrói um objeto plano estático).
- **Impacto com flags desligadas:** **zero async** — o hook detecta `present === false` e retorna fallback síncrono; nenhum `resolve()`, nenhum efeito. Engine byte-idêntico.
- **Impacto com flags ligadas:** um `resolve()` async por montagem/config, cache-friendly (config é const de módulo, `useMemo([config])` estável). Sem polling, sem timers.

## Segurança / Fail-safe
- **Flags:** off por padrão, fail-closed em produção (herdado do Direct Beta).
- **Fallback:** 7 cenários cobertos; a tela nunca quebra.
- **Sem backend/Prisma:** o módulo não importa `src/apis`/Prisma/backend; `hasForbiddenReference` derruba qualquer model que referencie backend/fetch/storage.
- **Sem runtimeBridge global:** não importa `makBootstrap`/`runtimeBridge`.
- **Sem outras telas:** só ModeloBase1/empresas/cadcps no diff (gate de escopo).
- **Sem write real:** write guard do model + gates no engine.
- **Sem dependência nova.**
- **Payload validation:** funções/handlers/React elements/pollution/sensível → rejeitados → fallback.
- **Desacoplamento:** `safety.js` local mantém o ModeloBase1 sem importar `src/runtime` (verificado por teste + gate).

## Riscos
- **Regressão no ModeloBase1:** a edição toca o componente de render real.
- **Divergência de table/form:** legado × v2 (vocabulário de colunas já mapeado como warning).
- **Write bloqueado incorretamente:** se `writeBlocked` vazasse com flag off.
- **Fallback não aplicado:** se um cenário anômalo não caísse no fallback.
- **Escopo amplo demais em ModeloBase1.**

## Mitigações
- **Resolver isolado** + **validator** de duas camadas + **fallback** explícito.
- Flag off → caminho síncrono idêntico (write nunca bloqueado com flag off — testado).
- **Gates de escopo** (autorizado + paths proibidos) + **App.jsx untouched**.
- **29 testes** + regressão completa (1155/1155, todos os gates g423, ModeloBase1 cert 10/10 + 11/11).
- Ponto de integração **mínimo** (um hook + gates de write + banner) — engine não reescrito.

## Próximo passo recomendado
**ModeloBase1 Controlled Local Write Plan** ou **ModeloBase1 Beta UI Hardening** — evoluir o consumo do grid a partir de `runtimeRead.table/form` e, depois, introduzir write local controlado atrás de flag + write guard explícito e testado.
