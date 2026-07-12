# Studio Risk Register

| # | Risco | Área | Sev. | Prob. | Impacto | Mitigação | Slice futuro |
|---|---|---|---|---|---|---|---|
| 1 | Studio virar tela simples demais | visão | Alta | Média | fábrica vira config screen | tratar como fábrica de módulos | Studio Foundation Contracts |
| 2 | criar módulo antes do Blueprint | processo | Alta | Média | módulo manual descartável | No-New-Modules + gate | Contracts |
| 3 | Blueprint gerar rota/menu cedo | UI/registro | Alta | Média | poluição de produção | route/menu apenas planejados | Registry slice |
| 4 | Blueprint criar schema/migration auto | dados | Crítica | Baixa | corrupção de produção | persistence boundary; sem auto-migration | Persistence slice |
| 5 | quebrar ModeloBase1 | integração | Alta | Baixa | regressão de cadastros | não alterar MB1; usar como referência | — |
| 6 | confundir ModeloBase2 experimental com produção | arquitetura | Média | Média | operação instável | manter MB2 sandbox | — |
| 7 | reescrever Empresas cedo demais | produção | Alta | Baixa | regressão real | Empresas só referência | — |
| 8 | abrir permissão por padrão | segurança | Crítica | Média | acesso indevido | default-deny | Permission slice |
| 9 | gerar módulo sem tenant scope | segurança | Crítica | Baixa | leakage entre clientes | tenant scope obrigatório | Contracts |
| 10 | gerar campo sem validação | qualidade | Média | Média | dados inválidos | validation blueprint | Field slice |
| 11 | dependência circular | arquitetura | Média | Baixa | build/complexidade | metamodel com relações acíclicas | Contracts |
| 12 | marketplace antes do registry | processo | Média | Baixa | distribuição insegura | registry primeiro | Registry slice |
| 13 | performance ruim com muitos campos/modelos | performance | Média | Média | lentidão | envelope local + limites | Hardening futuro |
| 14 | acoplamento forte com UI atual | arquitetura | Alta | Média | difícil evoluir | contracts headless primeiro | Contracts |
| 15 | falta de gates para módulos gerados | governança | Alta | Média | módulo sem controle | GatePlan obrigatório | Contracts |
