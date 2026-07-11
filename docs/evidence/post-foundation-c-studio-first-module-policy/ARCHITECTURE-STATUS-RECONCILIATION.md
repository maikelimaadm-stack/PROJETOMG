# Estado atual oficial da arquitetura

Reconciliação oficial pós-Foundation C. Este documento classifica formalmente cada bloco
da arquitetura atual e é a referência canônica para futuras sessões de IA e para o mantenedor.

## Produção existente

- **Sistema atual** (MAK Gestão React/Vite + Fastify/Prisma) — telas e fluxos reais em uso.
- **Cadastro de Empresas** (`src/modules/empresas/`) — módulo real, UI real, fluxo real.
- **cadcps / Campos Personalizados** (`src/modules/cadcps/`) — quando parte do fluxo atual.
- **ModeloBase1** (`src/ModeloBase1/`) — quando consumido por telas existentes (Empresas/cadcps).

## Laboratório real controlado

- **Cadastro de Empresas** — a base real e existente onde futuros pilotos de
  backend/Prisma/persistência serão validados, sempre em slices explícitos e separados.

## Beta / controlado

- Rotas **dev-only** existentes (guardadas por ambiente + flag, fail-closed em produção):
  - runtime-v2 dev preview (`/__dev/runtime-v2/previews`)
  - ModeloBase2 fuel dev preview (`/__dev/modelobase2/fuel`)
- Dev previews e harnesses de comparação (shadow/preview) — nunca telas oficiais.

## Experimental

- **ModeloBase2** (`src/ModeloBase2/`) — base experimental/headless para lançamentos operacionais futuros.
- **Fuel Headless Candidate** (`src/ModeloBase2/fuel-headless/`).
- **Fuel UI Sandbox** (`src/ModeloBase2/fuel-ui-sandbox/`).
- **Fuel Dev Preview Route** (`src/ModeloBase2/fuel-ui-sandbox/dev-preview/`).
- **Fuel Module Shell Readiness** (`src/ModeloBase2/fuel-module-shell/`).

## Futuro estratégico

- **Studio** (Studio Foundation)
- **Module Blueprint**
- **Module Registry**
- **Field Builder**
- **Screen Builder**
- **Permission Blueprint**
- **Persistence Blueprint**
- **Marketplace futuro**

## Não produção

- **Fuel não é módulo real** — não existe `src/modules/combustivel` nem `src/modules/fuel`.
- **ModeloBase2 não é o framework oficial final de módulo** ainda — é laboratório headless.
- **Dev preview não é tela oficial** — é superfície de inspeção dev-only.
- **Module shell readiness não é registro de módulo** — apenas contrato/planos/limites.

Invariantes confirmados em todo o bloco experimental: `moduleRegistered:false`,
`routeRegistered:false`, `menuRegistered:false`, `backendRegistered:false`,
`persistenceReal:false`, `localOnly:true`, `sent:false`.

## Próximo foco

- Organizar a arquitetura antes de criar módulos.
- Fortalecer **ModeloBase1** e **Empresas**.
- Usar **Empresas** como laboratório real controlado para testes reais quando necessário.
- Preparar **Studio Foundation**.
- Preparar **Module Blueprint**.
- Criar módulos novos **somente depois** de Studio/Blueprint maduros e decisão explícita do mantenedor.
