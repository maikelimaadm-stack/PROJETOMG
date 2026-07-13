# NEXT SLICE SPEC

## Recomendação

**POST-FOUNDATION C — EMPRESAS CERTIFIED BLUEPRINT MIRROR & ALIGNMENT AUDIT**

Slice de **audit + mirror headless**. Usa o Cadastro de Empresas como laboratório
real/controlado e seed model certificado para criar um **espelho de blueprint** do
Studio, ainda **sem alterar Empresas**.

## Objetivo

Mapear e auditar o alinhamento entre Empresas e o Studio Blueprint Contract certificado:

- Empresas certified local read contract
- campos reais de Empresas
- tabela/form/filtros atuais
- permissões esperadas
- tenant/multiempresa
- persistence boundary atual
- runtime binding ModeloBase1
- preferências/layout atuais
- pontos de desalinhamento com o Studio Blueprint Contract certificado
- o que precisará mudar em Empresas no futuro

## Regras do próximo slice

- pode criar blueprint mirror headless de Empresas
- pode auditar alinhamento
- **não** reescrever Empresas ainda
- **não** alterar UI/backend/Prisma
- **não** criar módulo novo
- deve produzir um plano de alignment slices

## Depois dele, se necessário

**POST-FOUNDATION C — EMPRESAS STUDIO COMPATIBILITY SLICE 1** — nesse slice futuro,
Empresas poderá ser modificada de forma controlada se tecnicamente necessário.

## Não recomendar imediatamente

UI do Studio · menu Studio · module generation real · staging · production · migration ·
marketplace · novo módulo Combustível/Pesagem.
