# QUALITY & SCALABILITY NOTES — EMPRESAS LOCAL READ PARITY HARDENING

## Objetivo
Endurecer o contrato local read-only de Empresas antes de qualquer staging ou integração produtiva.

## Qualidade
- datasets em escala
- queries compostas
- tenant fuzzing
- permission matrix
- error contract
- deterministic parity digests
- exact parity
- mutation blocker
- no-network/no-Prisma/no-production

## Escalabilidade
- tiny/small/medium/large
- até 2.000 fixtures sintéticas
- múltiplos tenants (>=4 em medium/large)
- paginação em escala
- sort estável
- filtros compostos
- performance baseline local
- cenário reutilizável para outros cadastros existentes

## Riscos
- simulação local divergir do backend real
- performance local mascarar gargalo de rede/banco
- fixtures não cobrirem constraints reais
- benchmark variar por hardware
- ampliação acidental da exceção productionUiGuard
- permission matrix incompleta
- digest ignorar campo relevante

## Mitigações
- contratos baseados nos arquivos reais
- cenário runner
- exact parity
- digests determinísticos (chamada `{ value }` corrigida)
- benchmark sem SLA rígido
- gate de escopo + verificação de exceção limitada
- próxima certificação antes de staging
