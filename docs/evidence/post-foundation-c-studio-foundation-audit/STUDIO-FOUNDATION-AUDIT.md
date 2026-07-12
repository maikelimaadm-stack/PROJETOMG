# O que o MAK Studio deve ser

Auditoria arquitetural. **O Studio NÃO é implementado neste slice** — aqui apenas o especificamos.

O Studio deve ser uma **camada para criar/configurar modelos e módulos** — uma **fábrica de módulos
configuráveis**, não uma simples tela de configurações.

## Visão

**Studio = fábrica de módulos configuráveis.**
**Não:** Studio = tela simples de configurações.

Futuramente o Studio deve permitir:

- criar modelos
- criar campos
- criar telas
- criar tabelas
- criar formulários
- criar validações
- criar relacionamentos
- criar permissões
- criar rotas
- criar menu
- criar persistence boundary
- gerar diagnostics
- gerar gates
- preparar marketplace

## Por que agora é audit, não implementação

- A política Studio-first (slice anterior) congela módulos novos até Studio + Module Blueprint.
- Empresas já é um contrato **certificado local read-only** (referência real).
- Implementar Studio como tela cedo demais acoplaria a fábrica à UI atual e ao ModeloBase1.
- A ordem correta é: **audit → contracts headless → sandbox → preview → registry → geração controlada → marketplace.**

## Nota sobre o `src/studio/` existente

Já existe uma árvore `src/studio/` versionada no repositório (business, computation, core, dependency,
designSystem, contributions, components, …). Este slice é **audit-only** e **não altera** nenhum
arquivo dessa árvore — ela é tratada como fora de escopo aqui. Esta auditoria especifica a **fundação
de fábrica de módulos** (metamodel, blueprints, boundaries, gates) que o Studio precisa para gerar
módulos configuráveis com segurança; slices futuros decidirão como/se reaproveitar a árvore existente.
A regra Studio-first e o congelamento de módulos novos permanecem válidos.

## Princípio central

**NOVOS MÓDULOS DEVEM NASCER PELO STUDIO E PELO MODULE BLUEPRINT** — nunca por código manual.

O Studio é: fábrica de módulos · de modelos · de campos · de telas · de validações · de permissões ·
de rotas/menu · de contratos · de diagnostics/gates · base futura de marketplace.
