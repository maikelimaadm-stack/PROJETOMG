# QUALITY & SCALABILITY NOTES — GENERIC MODEL MULTI-TYPE HARDENING

## Objetivo
Explicar o hardening multi-type do Generic Model Runtime.

## Escalabilidade
- **custo do registry**: construção O(n) sobre as definições (n=8), cada uma validada uma vez;
  `get` retorna cópia segura O(tamanho da definição).
- **custo da capability matrix**: O(tipos × capacidades) — matriz pequena e constante.
- **custo da conformance suite**: O(adapters × regras aplicáveis); cada regra é uma checagem de
  presença/flag O(1), exceto o scan de forbidden-target (linear no descriptor autorado, com os
  contratos confiáveis do kernel excluídos).
- **impacto em MB1**: nenhum — MB1 não é importado nem alterado (injetado no teste).
- **impacto em MB2**: nenhum — idem.
- **impacto em futuros modelos**: o padrão (definição + capacidades + conformance) escala para
  novos tipos sem tocar os adapters existentes.

## Segurança / Fail-safe
- dangerous capabilities **false** por padrão (`dangerousAllFalse`).
- sem backend/Prisma, sem runtimeBridge, sem storage obrigatório, sem UI real, sem fetch.
- `conformance` gate + `multi-type diagnostics` provam os invariantes comuns.
- `persistenceReal` nunca liberado neste estágio.
- generic runtime **não importa** MB1/MB2 (isolamento por import-scan no gate).

## Riscos
- conformance rígida demais (falso-negativo em adapter legítimo).
- conformance frouxa demais (deixar passar adapter inseguro).
- registry virar abstração prematura.
- diferenças futuras de modelos exigirem novos contracts.

## Mitigações
- registry extensível (`register` validado).
- capability matrix + `allowedDifferences` explícitas.
- detecção tolerante de contratos (evita rigidez).
- testes (21 casos / 56 cenários) + gate (27 checks) + evidências.

## Próximo passo recomendado
ModeloBase2 Operational Runtime Foundation.
