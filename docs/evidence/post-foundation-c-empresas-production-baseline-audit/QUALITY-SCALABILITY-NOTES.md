# QUALITY & SCALABILITY NOTES — EMPRESAS PRODUCTION BASELINE AUDIT

## Objetivo
Auditar Empresas como laboratório real controlado antes de qualquer backend/Prisma/persistência real.

## Qualidade
- evita mexer em produção sem mapa
- preserva UI atual
- preserva ModeloBase1
- identifica riscos antes de implementação
- separa laboratório real (Empresas) de sandbox experimental (Fuel/ModeloBase2)
- documenta que Empresas já é produção viva (backend/Prisma/persistência reais)

## Escalabilidade
- Empresas serve como piloto real sobre um stack já existente
- ModeloBase1 pode ser fortalecido; o `runtimeReadModel` runtime-v2 já existe (flag, read-only)
- backend/Prisma podem ser evoluídos com base real e test plan
- módulos novos continuam congelados até Studio/Blueprint

## Riscos
- usar Empresas como teste descartável (é produção viva — risco crítico)
- avançar para backend/escrita cedo demais
- quebrar preferências/layout
- quebrar fluxo real de cadastro
- subestimar migration sobre dados reais

## Mitigações
- auditoria baseline (este slice)
- test plan antes de implementação (próximo slice)
- gates próprios por etapa
- fallback por flag (fail-closed em produção; byte-idêntico quando off)
- dados de teste isolados de produção
- aprovação explícita do mantenedor

## Custo
Slice **somente docs/tests/gate** — custo zero em runtime de produção, zero alteração de código,
zero dependência nova. Valor: mapa canônico e registro de riscos antes de tocar um sistema vivo.
