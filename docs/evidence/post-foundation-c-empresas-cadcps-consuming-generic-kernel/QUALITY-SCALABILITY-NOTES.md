# QUALITY & SCALABILITY NOTES — EMPRESAS/CADCPS CONSUMING GENERIC KERNEL

## Objetivo
Explicar o consumo do Generic Kernel por Empresas e cadcps através do ModeloBase1.

## Escalabilidade
- **custo do adapter**: uma instância leve por chamada (`createModeloBase1GenericModelAdapter`),
  descritor + bridges; sem IO.
- **custo de read validation genérica**: `validateGenericModelReadModel` é O(colunas+linhas+campos)
  sobre o payload já sanitizado; sem regex custosa em hot path.
- **custo de mapping MB1 → Generic → MB1**: dois passes (`safeClone`/round-trip JSON) sobre o
  `table`/`form`; proporcional ao tamanho do read model.
- **impacto com flags desligadas**: praticamente nulo — o resolver retorna cedo e o `apply`
  devolve o estado verbatim (um único `safeClone`).
- **impacto com flags ligadas**: um round-trip adicional do read model por render de leitura;
  aceitável para o volume das telas beta.

## Segurança / Fail-safe
- **flags**: default off; fail-closed em produção salvo `*_ALLOW_PROD`.
- **fallback**: total, em 7 cenários, sempre preservando o fluxo atual.
- **dangerous capabilities false**: `backendWrite`/`workflow`/`connector`/`marketplacePublish`.
- **sem backend/Prisma**, **sem runtimeBridge**, **sem storage obrigatório**, **sem fetch**.
- **local write localOnly**; **persistenceReal false**.

## Riscos
- divergência de shape `table`/`form` entre o kernel e o esperado pelo engine.
- fallback incompleto em algum caminho não coberto.
- duplicação temporária entre validators MB1 e validators genéricos.
- confusão entre **consumo** do kernel e **substituição** completa.

## Mitigações
- consumo **por flag** (gradual, reversível).
- adapter **fino** (não reescreve o engine).
- **testes de shape** (columns/rows/fields/visible*).
- **fallback** provado por teste + gate.
- **gates de escopo** (import-scan estrutural permanente).
- **evidências** completas.

## Próximo passo recomendado
ModeloBase1 Generic Kernel Hardening ou modeloBase2 Prototype Adapter.
