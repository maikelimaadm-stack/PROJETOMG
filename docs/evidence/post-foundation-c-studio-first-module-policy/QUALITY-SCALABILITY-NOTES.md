# QUALITY & SCALABILITY NOTES — STUDIO-FIRST MODULE POLICY

## Objetivo
Organizar o estado atual e evitar criação prematura de módulos.

## Qualidade
- reduz confusão entre sandbox e produção
- separa laboratório técnico (Fuel/ModeloBase2) de laboratório real (Empresas)
- preserva o trabalho já feito
- evita perda de arquitetura
- evita acoplamento prematuro
- evita módulos manuais antes do Studio

## Escalabilidade
- módulos futuros nascerão pelo Studio/Blueprint
- ModeloBase2 pode continuar como referência futura
- Fuel pode continuar como exemplo
- Empresas vira base real para validar produção
- Module Blueprint fica para depois
- Studio vira etapa central antes de módulos novos

## Riscos
- abandonar trabalho útil
- transformar teste em produção cedo demais
- criar módulos antes do Studio
- testar backend em módulo artificial
- confundir dev preview com produto

## Mitigações
- congelamento do Fuel (Fuel Sandbox Freeze)
- Studio-First Module Creation Policy
- Empresas Production Lab Policy
- No New Modules Policy
- gates (`g423-studio-first-module-policy` + agregado `g423`)
- evidências
- roadmap

## Custo
Este slice é **somente docs/tests/gate** — custo zero em runtime de produção, zero alteração de
código de aplicação, zero dependência nova. O valor é organizacional: uma âncora canônica para
futuras sessões de IA não regredirem a decisão do mantenedor (Studio-first).
