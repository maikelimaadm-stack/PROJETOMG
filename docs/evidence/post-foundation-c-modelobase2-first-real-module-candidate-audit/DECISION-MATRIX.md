# Decision Matrix

Pontuação: 1=ruim · 2=aceitável · 3=bom · 4=muito bom · 5=excelente.

> Contexto: os três candidatos são **greenfield** (nenhum existe no código). Assim, "menor risco de
> quebrar produção" é alto para todos (não há tela/serviço a regredir); o diferencial está na
> **simplicidade de shape** e no **encaixe natural com event/append**.

| Critério | Combustível | Pesagem | Apontamento |
|---|---|---|---|
| Simplicidade do fluxo | 5 | 3 | 2 |
| Fluxo event/append natural | 5 | 4 | 4 |
| Menor dependência de backend | 5 | 4 | 3 |
| Menor dependência de Prisma/schema | 5 | 5 | 4 |
| Menor dependência de runtimeBridge | 5 | 5 | 5 |
| Menor acoplamento com UI | 5 | 5 | 5 |
| Menor risco de quebrar produção | 5 | 5 | 5 |
| Adapter headless primeiro | 5 | 4 | 4 |
| Compatibilidade offline/local | 5 | 4 | 4 |
| Compatibilidade snapshot/restore | 5 | 4 | 4 |
| Compatibilidade command resolver | 5 | 4 | 3 |
| Clareza de validação de payload | 5 | 3 | 2 |
| Valor prático para o sistema | 4 | 4 | 4 |
| Proximidade com necessidade real do agro | 4 | 4 | 4 |
| Tempo estimado de implementação (menor=melhor) | 5 | 3 | 2 |
| Quantidade de arquivos envolvidos (menor=melhor) | 5 | 4 | 3 |
| **TOTAL (máx 80)** | **78** | **65** | **58** |

## Ranking final

1. **Combustível — 78/80** 🥇
2. **Pesagem — 65/80** 🥈
3. **Apontamento — 58/80** 🥉

## Decisão final

**Combustível** é o primeiro candidato. Justificativa objetiva:

- Shape mínimo e estável (data, máquina, litros, horímetro) → validação de payload trivial.
- Cada abastecimento é um **append natural** — encaixe 1:1 com o event log / command resolver.
- Zero cálculo derivado e zero device no primeiro slice (ao contrário de pesagem/balança).
- Menor superfície ⇒ menor tempo e menor risco de modelagem prematura.

Pesagem fica em 2º (cálculo de líquido + integração de balança latente). Apontamento em 3º (shape
mais variável e dependências futuras de ordens/serviços).
