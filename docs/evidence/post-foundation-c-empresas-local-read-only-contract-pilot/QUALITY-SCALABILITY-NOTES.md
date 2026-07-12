# QUALITY & SCALABILITY NOTES — EMPRESAS LOCAL READ-ONLY CONTRACT PILOT

## Objetivo
Validar localmente contratos de leitura de Empresas sem rede, produção, backend, Prisma ou mutation.

## Qualidade
- fixtures inteiramente sintéticas
- tenant isolation
- permission fail-closed
- repository read-only
- mutation blocker
- runtime parity
- fallback
- diagnostics
- nenhum dado real

## Escalabilidade
- dataset determinístico expansível
- filtros/sort/paginação testáveis
- repository contract reutilizável
- parity digest automatizável
- tenant matrix expansível
- base para staging read-only futuro

## Riscos
- simulação divergir da EmpresaApi real
- fixtures não cobrirem campos suficientes
- contrato local mascarar erro do backend
- sort/pagination diferirem da API real
- runtime projection divergir silenciosamente
- mutation ser exposta por export acidental

## Mitigações
- contrato baseado nos arquivos reais (envelope EmpresaApi copiado)
- parity checker (sem divergência silenciosa)
- mutation blocker
- gate de no-network / no-Prisma / no-DATABASE_URL
- diagnostics
- próximo hardening local antes de staging
