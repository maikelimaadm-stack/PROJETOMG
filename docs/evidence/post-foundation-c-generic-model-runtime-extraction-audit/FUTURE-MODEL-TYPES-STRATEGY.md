# FUTURE MODEL TYPES STRATEGY

Como o Generic Model Runtime serviria cada tipo de modelo. Para cada: objetivo, contratos usados, adapters necessários, write/persistence esperados, riscos.

## modeloBase1 — Cadastro / config-driven

- **Objetivo:** cadastro (Empresas, Campos, clientes, produtos).
- **Contratos:** ReadModel, WriteContract (local), PersistenceContract, SafetyPolicy.
- **Adapters:** ModeloBase1Adapter (já existe como cadeia atual) → refatorar para consumir o kernel.
- **Write/persistence:** local write ✅ (provado), persistence validation ✅ (provado); write real depois.
- **Riscos:** baixo — é o laboratório de referência.

## modeloBase2 — Lançamento operacional

- **Objetivo:** combustível, pesagem, lançamentos diários, apontamentos.
- **Contratos:** ReadModel, WriteContract (**write é o núcleo** — muitos inserts), PersistenceContract (offline-first forte), SafetyPolicy.
- **Adapters:** modeloBase2Adapter (novo) — mapeia formulário de lançamento → mutation; provavelmente sem "form de edição" pesado, mais entrada rápida.
- **Write/persistence:** local write intenso; **persistence real prioritária** (lançamentos não podem se perder). Offline-first.
- **Riscos:** o contrato local write atual assume "1 draft table"; lançamentos podem exigir fila de eventos/append-only → validar se o controller genérico cobre append.

## modeloBase3 — Movimentação / estoque

- **Objetivo:** entrada, saída, transferência, inventário.
- **Contratos:** ReadModel, WriteContract, PersistenceContract, SafetyPolicy + (futuro) contrato de **transação/consistência** (saldo).
- **Adapters:** modeloBase3Adapter — mutation com efeito em saldo (cálculo local antes de persistir).
- **Write/persistence:** local write + persistence + validação de integridade (saldo não-negativo) — o checksum/versioning ajuda.
- **Riscos:** consistência/atomicidade além do escopo do controller atual; precisa de contrato de transação futuro.

## modeloBase4 — Financeiro

- **Objetivo:** contas a pagar/receber, conciliação, caixa.
- **Contratos:** ReadModel, WriteContract, PersistenceContract, SafetyPolicy + contrato de **auditoria/imutabilidade**.
- **Adapters:** modeloBase4Adapter — forte em validação (valores, datas, status).
- **Write/persistence:** write local + persistence + auditoria (append-only, versioning obrigatório).
- **Riscos:** requisitos regulatórios/auditoria; máscara de dados sensíveis já ajuda; precisa de retenção.

## modeloBase5 — Relatório / dashboard

- **Objetivo:** KPIs, gráficos, pivot, painéis.
- **Contratos:** **ReadModel apenas** (read-only puro); Diagnostics; SafetyPolicy.
- **Adapters:** modeloBase5Adapter — mapeia read model → visualização (não usa write/persistence).
- **Write/persistence:** **nenhum** (read-only). Talvez persistence de *configuração de painel* (local).
- **Riscos:** baixo; o read model + diagnostics já cobrem; cuidado com performance de grandes datasets (o kernel deve permitir paginação/streaming futuramente).

## modeloBase6 — Workflow / processo

- **Objetivo:** aprovação, etapas, tarefas, automações.
- **Contratos:** ReadModel, WriteContract + contrato de **workflow/estado** (transições), SafetyPolicy (side-effects gated).
- **Adapters:** modeloBase6Adapter — mapeia ação de UI → transição de estado (local antes de efetivar).
- **Write/persistence:** write local (mudança de estado) + persistence; execução real de action/workflow/connector **fica atrás de capability gate** explícito.
- **Riscos:** alto — side effects reais; a SafetyPolicy (side-effects blocked por default) é essencial; precisa de contrato de workflow dedicado.

## Módulos nativos (código do time)

- Consomem o kernel via adapter do modelo-base correspondente. Config-driven onde possível; código custom onde necessário. Herdam safety/fallback/diagnostics de graça.

## Módulos criados pelo usuário (via Studio)

- Declaram fields/validations/actions/persistence policy; o kernel executa. Nunca recebem capacidade perigosa sem gate. Ver STUDIO-MARKETPLACE-COMPATIBILITY.md.

## Conclusão

- O kernel atual (read/write-local/persistence-local/safety/fallback/diagnostics) cobre bem **cadastro (base1)** e **relatório read-only (base5)**.
- **base2/base3/base4/base6** exigem contratos adicionais (append/evento, transação/saldo, auditoria/imutabilidade, workflow/estado) — a extração deve deixar esses pontos como **extensões previstas**, não reescrever o core.
