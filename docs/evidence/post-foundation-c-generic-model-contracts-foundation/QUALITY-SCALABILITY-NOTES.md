# QUALITY & SCALABILITY NOTES — GENERIC MODEL RUNTIME CONTRACTS FOUNDATION

## Objetivo
Explicar a fundação genérica inicial para modelos MAK — contratos/utilitários puros que futuros adapters (ModeloBase1, modeloBase2..6) consumirão.

## Escalabilidade
- **Custo dos validators:** deep-scan limitado a profundidade 8 sobre payloads pequenos — barato e determinístico.
- **Custo dos diagnostics:** O(1) — flags/counts.
- **Custo do adapter in-memory:** Map; save/load/list/delete O(1)/O(n) sobre poucos snapshots.
- **Custo do checksum:** FNV-1a linear no JSON canônico.
- **Impacto com futuros modelos:** cada modelo adiciona só um adapter fino; o core não muda. Contratos compartilhados evitam duplicação por modelo.

## Segurança / Fail-safe
- **pure functions** · **no React/DOM** · **no backend/Prisma** · **no runtimeBridge** · **no storage obrigatório**.
- **dangerous capabilities false** por padrão; opt-in auditável.
- **payload validation** fail-closed; **fallback/rollback** disponíveis.
- **safe copies** (safeClone); mutar retorno não altera estado interno.
- **detector** nomeia tokens de sink via fragmentos para não disparar scanners repo-wide, mantendo detecção em runtime.

## Riscos
- **abstração cedo demais** — só há 1 consumidor real (ModeloBase1); mitigado por não substituir ainda.
- **contrato incompleto** — persistência real não desenhada; documentado como extensão futura.
- **divergência com ModeloBase1 real** — mitigado por Fase 3 (adapter provado por paridade antes de migrar).
- **confundir foundation com runtime ativo** — a fundação é paralela e não wired em telas.

## Mitigações
- não substituir ModeloBase1 ainda; foundation pura; gates de isolamento (no-React/no-ModeloBase1/no-backend); 23 testes; evidências.

## Próximo passo recomendado
**ModeloBase1 Adapter to Generic Kernel.**
