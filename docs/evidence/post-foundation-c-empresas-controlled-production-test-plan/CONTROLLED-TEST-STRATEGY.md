# Controlled Test Strategy — Empresas

Estratégia geral para testar futuramente o Cadastro de Empresas (backend + Prisma + persistência
reais) **sem arriscar dados de produção**. Este slice é **plano**, não implementação.

## Princípio de segurança (inviolável)

**PRODUCTION DATA MUST NOT BE USED AS TEST DATA.**

Nenhum plano pode depender de: editar/excluir uma empresa real; reutilizar tenant produtivo sem
isolamento; alterar preferências reais; migration em produção; permissões em usuário produtivo;
credencial produtiva em teste automatizado; DELETE sem fixture isolada; teste destrutivo sem rollback
determinístico.

## Camadas de teste (do mais seguro ao mais arriscado)

| Camada | O que valida | Mutation | Ambiente |
|---|---|---|---|
| **Unit** | adapters, payloads, validações, runtimeReadModel, fallback, permission resolver, multiempresa, cache otimista, erros tipados | simulada (mock/repository) | node --test |
| **Local integration** | contrato repository/API, migration em cópia sintética, CRUD isolado | real em banco local/efêmero | local |
| **Staging isolado** | pilotos read/write sobre dataset sintético, paridade, performance | real, com gate + cleanup | staging separado |
| **Produção** | apenas observabilidade passiva (futuro, com aprovação) | **proibida** | produção |

## Sequência de pilotos (fases)

1. **R0/W0 — Unit**: contratos e mapeamentos, sem I/O real.
2. **R1/W1 — Local integration**: backend + Prisma locais, fixtures sintéticas, cleanup.
3. **R2 — Staging read-only**: comparação ModeloBase1 × runtime-v2, sem mutation.
4. **W2 — Staging write controlado**: flag explícita, tenant/usuário/registro sintéticos, rollback obrigatório.
5. **R3/W3 — Produção**: **proibido** para teste funcional; só observabilidade passiva futura.

## Guardas transversais

- Toda ativação atrás de **feature flag** reversível (fail-closed em produção).
- Todo write de teste exige **testRunId** + **IDs explícitos** para cleanup.
- Toda fixture é **sintética e identificável** (prefixo `MAK_TEST_<RUN_ID>_...`).
- Toda paridade ModeloBase1 × runtime-v2 é verificável e sem divergência silenciosa.
- Nenhum bypass de tenant/JWT/permission/cleanup pode ser planejado.

## O que este slice NÃO faz

Nenhuma implementação; nenhuma mutation; nenhuma migration; nenhuma alteração de UI/backend/Prisma/
runtime; nenhum código de produção tocado. Apenas define o plano e os gates futuros.
