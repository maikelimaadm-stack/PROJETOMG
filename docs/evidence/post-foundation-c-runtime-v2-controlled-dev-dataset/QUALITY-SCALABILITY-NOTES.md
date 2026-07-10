# QUALITY & SCALABILITY NOTES — RUNTIME V2 CONTROLLED DEV DATASET

## Objetivo

Explicar a camada de dataset controlado dev-only que alimenta os previews runtime v2 (empresas + cadcps) com registros simulados, determinísticos e seguros, sem dados reais e sem alterar produção.

## Módulos incluídos

- Empresas
- cadcps

## Escalabilidade

- **Custo de criação do dataset:** O(módulos × registros × campos) — cada dataset constrói registros/tableRows/formValues/estados uma vez, com mascaramento O(campos) e uma cópia profunda. Sem I/O, sem rede.
- **Custo por módulo:** O(registros × campos) — os datasets iniciais têm 3 registros cada.
- **Custo de records/tableRows/formValues:** cada getter faz uma cópia profunda O(tamanho do payload solicitado).
- **Limites de registros:** `MAX_RECORDS_PER_MODULE = 50` — verificado no builder; exceder lança `MAK-L3-DEV-DATASET-002`.
- **Limites de profundidade:** `MAX_PAYLOAD_DEPTH = 8` — verificado por `validateDatasetShape`; exceder lança `MAK-L3-DEV-DATASET-001`.
- **Impacto com a flag DESLIGADA:** zero — o dataset não constrói nada; `getModules()` retorna `[]`.
- **Impacto em dev com a flag LIGADA:** o custo de construir dois datasets pequenos e servir cópias seguras sob demanda, num contexto dev isolado.

## Segurança / Fail-safe

- **Opt-in:** desligado por padrão; `MAK_RUNTIME_V2_CONTROLLED_DEV_DATASET` só liga quando exatamente `'true'`.
- **Dev-only:** requer ambiente não-produção; em produção **falha fechado** salvo o override explícito e documentado `..._ALLOW_PROD`.
- **Produção falha fechada:** ver acima.
- **Sem dados reais:** apenas exemplos claramente fictícios; metadata `source: 'controlled-dev-dataset'`, `mocked: true`.
- **Sem side effects:** nenhuma função com side effect; nunca executa action/workflow/connector; nunca salva/edita/exclui.
- **Sem backend/Prisma/MMM direto:** nenhuma chamada a Prisma, `@prisma/client`, `backend/`, `fetch`, `XMLHttpRequest`, `WebSocket`. Verificado por teste e gate.
- **Sem storage externo:** nenhum `localStorage`/`sessionStorage`/`IndexedDB`.
- **Dados sensíveis mascarados:** `apiKey`/`token`/... → `[REDACTED]` em valores e metadata; campos negados ocultados como `[DENIED]`.
- **Poluição de protótipo bloqueada:** `__proto__`/`constructor`/`prototype` nas options/specs lançam `MAK-L3-DEV-DATASET-001`.

## Determinismo

- **Mesmo input gera mesmo dataset:** os datasets são constantes; sem timestamps/aleatoriedade; `deepEqual` para a mesma entrada.
- **Retornos são cópias seguras:** todos os getters fazem cópias profundas — mutar o retorno nunca altera o estado interno.
- **Runtime legado não é alterado:** o dataset apenas produz dados simulados; nunca toca o bridge.
- **UI real não é alterada:** nenhuma rota/menu; nenhum import de `src/modules`.

## Genericidade

- **empresas usa dataset específico controlado** (`createEmpresasControlledDataset`).
- **cadcps usa o builder controlado genérico** (`createControlledModuleDataset` via `createCadcpsControlledDataset`).
- **hub pode consumir o resumo do dataset** de forma opt-in (`getSummaryByModule`), sem alterar o comportamento quando desligado.

## Débitos técnicos controlados

- **Ainda não usa dados reais:** só datasets mock controlados.
- **Ainda não substitui tela real:** as UIs continuam servidas pelo runtime legado.
- **Ainda não executa ações reais:** nenhum CRUD/action/workflow/connector.
- **Ainda não cria Studio:** nada do Studio é tocado.
- **Migration planning fica para próximo slice:** planejar a migração de um módulo piloto, ou uma rota dev-only protegida para o hub + dataset, é o próximo passo.

## Conclusão

A camada de dataset controlado dev-only está apta para merge do ponto de vista de qualidade: registros simulados determinísticos e seguros para empresas + cadcps (válidos/inválidos/negados, campos obrigatórios vazios, sensíveis mascarados), opt-in e fail-closed em produção, integrável ao hub de forma opt-in e sem regressão, com limites de registros e profundidade, cópias seguras, sem dados reais, sem side effect, sem backend/Prisma/MMM/storage, e runtime legado / UI de produção / `src/App.jsx` / menu / Foundation C completamente preservados, sem dependência nova, sem CSS global novo.
