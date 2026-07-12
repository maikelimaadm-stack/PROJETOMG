# Next Slice Spec — Empresas Local Read-Only Contract Pilot

## Próximo slice recomendado

**POST-FOUNDATION C — EMPRESAS LOCAL READ-ONLY CONTRACT PILOT**

Objetivo: implementar um piloto **local / read-only** para validar contratos de leitura de Empresas
**sem tocar produção**, **sem mutation** e **sem alterar UI**.

## Por que este é o primeiro piloto

- É o passo de **menor risco**: sem mutation, sem produção, sem migration, sem UI.
- Valida os contratos antes de qualquer escrita.
- Reaproveita a bateria de paridade/leitura já existente.

## Escopo provável (futuro)

- test harness local
- fixtures sintéticas (contrato `MAK_TEST_<RUN_ID>_...`)
- repository/API contract adapter
- payload validation
- tenant scope validation
- error mapping
- runtimeReadModel / fallback parity
- tests + gate + evidence

## Características

- sem UI alterada
- sem backend alterado
- sem Prisma/schema alterado
- sem migration
- sem mutation
- banco local ou fixture in-memory
- validação do contrato `EmpresaApi`/repository
- validação do payload de listagem
- validação de tenant scope
- validação de erros
- validação de runtimeReadModel/fallback

## Proibido no próximo slice

create/update/delete real · produção · staging write · migration · schema change · App/menu ·
alteração visual · Fuel/ModeloBase2 · módulo novo.

## NÃO recomendar como primeiro piloto

produção write · staging write · migration · delete · mudança de schema · mudança de UI · mudança
de preferência real.
