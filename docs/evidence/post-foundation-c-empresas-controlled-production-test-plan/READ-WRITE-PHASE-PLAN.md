# Read/Write Phase Plan — Empresas

Pilotos em fases, do mais seguro ao mais arriscado. **Nenhuma execução em produção.**

## Leitura

### Fase R0 — Unitária
payload mapping · repository contract · runtimeReadModel · fallback · filtering · sorting ·
pagination · permission checks. Sem I/O real.

### Fase R1 — Local integration
backend local · Prisma local · dataset sintético · tenant sintético · autenticação sintética ·
resposta real do endpoint.

### Fase R2 — Staging read-only
staging isolado · fixtures sintéticas · **sem mutation** · comparação ModeloBase1 × runtime-v2 ·
observação de performance · coleta de diagnostics.

### Fase R3 — Produção
**Não autorizar teste funcional em produção.** Somente observabilidade passiva futura, com aprovação
explícita.

## Escrita

### Fase W0 — Unitária
create payload · update payload · delete guard · validation · optimistic cache
(`patchEmpresasCache`) · error mapping · rollback local.

### Fase W1 — Local integration
banco local/efêmero · create fixture · read fixture · update fixture · delete fixture · cleanup ·
confirmação de isolamento.

### Fase W2 — Staging controlado
feature flag explícita · tenant sintético · usuário sintético · registro sintético · `testRunId` ·
rollback/cleanup obrigatório · nenhuma execução paralela sem lock.

### Fase W3 — Produção
**Proibido por enquanto.** Nenhum write pilot produtivo deve ser recomendado como próximo passo imediato.

## Ordem recomendada

R0 → W0 → R1 → W1 → R2 → (aprovação) → W2. R3/W3 permanecem fora de escopo.
