# Empresas — Risk Register

Registro de riscos para futuros pilotos reais em Empresas (auditoria; nada implementado).

| # | Risco | Área | Severidade | Probabilidade | Impacto | Mitigação | Slice futuro |
|---|---|---|---|---|---|---|---|
| 1 | Quebrar UI atual | UI | Alta | Média | Usuário perde tela funcional | flag off = byte-idêntico; parity-hardening; previews | Controlled Production Test Plan |
| 2 | Perder preferências/layout | UI/dados | Alta | Média | Colunas/filtros/ordenação perdidos | preservar subsistema `preferences/`; testes de regressão | Test Plan |
| 3 | Divergência ModeloBase1 vs runtime v2 | integração | Média | Média | Render/dados diferentes | shadow-compare + parity + dry-run já existentes | Read Pilot |
| 4 | Persistência inconsistente | dados | Alta | Baixa | Dados corrompidos | começar read-only; escrita só após paridade de escrita | Persistence Pilot |
| 5 | Migration mal planejada | backend/Prisma | Alta | Baixa | Perda/corrupção de dados reais | backup/rollback plan; staging; janela controlada | Persistence Pilot |
| 6 | Schema incompleto | Prisma | Média | Baixa | Retrabalho | schema proposal só se piloto exigir | Persistence Pilot |
| 7 | Permissões insuficientes | segurança | Alta | Baixa | Acesso indevido cross-empresa | respeitar `PermissaoEmpresa`; probe multiempresa | Permission Pilot |
| 8 | Multiempresa / escopo | segurança/dados | Alta | Média | Vazamento entre clientes | preservar `erp_empresa_id`/`empresaHeader`/`cliente_id` | Test Plan |
| 9 | Offline/local | dados | Baixa | Baixa | Estado local divergente | cache é auxiliar, não fonte de verdade | — |
| 10 | Performance | performance | Média | Média | Lentidão em listas grandes | índices já existentes; perf marks; infinite data | Read Pilot |
| 11 | Regressão visual | UI | Média | Média | Diferença visual sutil | parity-hardening + dev visual preview | Test Plan |
| 12 | Acoplamento indevido com Fuel/ModeloBase2 | arquitetura | Média | Baixa | Sandbox contaminando produção | Studio-First / No-New-Modules policies; gates de escopo | — |
| 13 | **Operar sobre dados reais de produção** | dados/negócio | **Crítica** | Média | Impacto direto em clientes | dados de teste isolados; nunca piloto de escrita em produção | Persistence Pilot |

## Observação-chave

O risco #13 é a diferença fundamental deste laboratório: Empresas **já é produção viva**. "Laboratório
real controlado" = validar sobre um sistema real **com máxima cautela**, não um sandbox descartável.
