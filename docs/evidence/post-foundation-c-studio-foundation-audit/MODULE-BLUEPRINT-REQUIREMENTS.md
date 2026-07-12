# Module Blueprint Requirements

Um **Module Blueprint** é a descrição declarativa completa de um módulo futuro.
**Nenhum módulo pode ser criado antes de um Module Blueprint válido** (regra Studio-first).

## Campos

moduleId · displayName · category · modelFamily · modelType · version · status · fields · screens ·
table · form · validations · relationships · permissions · routePlan · menuPlan ·
persistenceBoundary · runtimeBinding · diagnostics · gates · fallback · compatibility ·
migrationPolicy · publicationPolicy.

## Estados

draft · validated · previewable · certified_local · ready_for_staging · blocked · deprecated.

## Blueprint válido

- todos os campos obrigatórios presentes e coerentes;
- modelType ∈ {cadastro (ModeloBase1), operacional (ModeloBase2)};
- permissões default-deny; tenant scope presente;
- routePlan/menuPlan `productionAllowed:false` por padrão;
- persistenceBoundary declarado; sem Prisma/migration automáticos.

## Blueprint inválido

- campo obrigatório ausente; type de campo fora da allowlist; permissão aberta por padrão; ausência
  de tenant scope; rota/menu produtivos automáticos.

## Blueprint perigoso (bloqueado)

- libera mutation em produção; cria schema/migration automaticamente; publica módulo sem gate;
  registra rota/menu sem aprovação; reescreve Empresas/ModeloBase1.

## Operações proibidas

geração direta de código produtivo · publicação automática · registro automático em App/menu ·
escrita em dados reais · bypass de permissão/tenant.

## Como evitar que vire produção automaticamente

O blueprint é **declarativo**; a geração de módulo real exige um slice explícito + gates + aprovação
do mantenedor. Nenhum estado do blueprint (nem `ready_for_staging`) autoriza produção sozinho.
