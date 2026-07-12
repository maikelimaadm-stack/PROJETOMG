# Empresas Production Lab Policy

## Decisão oficial

O **Cadastro de Empresas** (`src/modules/empresas/`) será o **laboratório real controlado**
para testes de produção.

## Por quê

- já existe no sistema
- já tem UI real
- já tem fluxo real
- já é cadastro real
- é mais seguro validar backend/Prisma/persistência nele do que criar um módulo novo
- reduz o risco de construir um módulo artificial cedo demais

## Uso futuro permitido (somente com slice explícito)

Empresas poderá ser usado futuramente para testar, cada item em seu próprio slice separado e
aprovado:

- backend real
- Prisma / schema
- persistência real
- migrations controladas
- leitura / escrita real
- permissões reais
- runtimeReadModel real
- fallback de produção
- migration gradual
- compatibilidade com ModeloBase1

## Regras

- **nunca** fazer backend/Prisma em Empresas sem prompt específico
- cada mudança em Empresas precisa de **gate próprio**
- preservar a **UI atual**
- preservar o **fallback**
- preservar os **dados**
- testar **regressão**
- documentar a **migração**
- manter **reversibilidade** quando possível

## Princípio

Empresas **não** deve ser tratado como teste descartável.
É **laboratório real controlado**, não brinquedo.
