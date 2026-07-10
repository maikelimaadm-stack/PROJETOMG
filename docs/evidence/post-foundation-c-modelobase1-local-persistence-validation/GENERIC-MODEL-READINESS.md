# GENERIC MODEL READINESS — LOCAL PERSISTENCE VALIDATION

## Objetivo
Avaliar o quanto a fundação atual pode virar padrão para **todos os modelos MAK futuros**, não só o ModeloBase1.

## Já genérico
- **contrato** (`createModeloBase1LocalPersistenceContract`) — allowed/blocked/storageMode/safety são model-agnósticos.
- **adapter** (in-memory, injetável) — não depende de nada do ModeloBase1.
- **serialization** (draft plano + checksum + masking) — genérica desde que o draft tenha `table.rows`/`form`.
- **validation** (snapshot fail-closed) — genérica.
- **rehydration** — genérica.
- **versioning** (determinístico, clock injetável) — genérico.
- **diagnostics** — genéricos.
- **localOnly safety** (persistenceReal:false, Touched:false) — genérica.

## Ainda preso ao ModeloBase1
- **paths** (`src/ModeloBase1/runtime-read-model/local-write/persistence/`).
- **nomes** (`ModeloBase1...`, `modeloBase1-local-write`).
- **integração com runtimeReadModel específico** (o draft vem do controller local do ModeloBase1).
- **UI/hook** (painel/badge acoplados ao `ModeloBase1CadastroPage`).

## Futuro alvo
- modeloBase2
- modeloBase3
- módulos nativos
- módulos criados pelo usuário
- Studio
- Marketplace

## Riscos de generalizar cedo demais
- **abstração errada** — extrair antes de ter 2+ consumidores reais pode fixar a interface errada.
- **acoplamento oculto** — dependências implícitas do shape do read model do ModeloBase1.
- **perda de velocidade** — generalizar prematuramente atrasa entregas beta.
- **contratos incompletos** — persistência real (backend/Prisma) ainda não desenhada; extrair só a validação pode ocultar requisitos.

## Recomendação
Próximo slice recomendado:
**POST-FOUNDATION C — GENERIC MODEL RUNTIME EXTRACTION AUDIT** — auditar (sem mover ainda) o que extrair para um contrato genérico de persistência local reutilizável por todos os modelos.
