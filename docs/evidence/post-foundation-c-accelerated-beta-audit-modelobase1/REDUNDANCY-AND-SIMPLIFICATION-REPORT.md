# REDUNDANCY & SIMPLIFICATION REPORT

## Contexto

A cadeia runtime v2 (17 camadas) foi construída sob a premissa antiga **"nunca tocar a tela real"**. Cada slice adicionou uma camada de aproximação read-only (shadow → preview → read-only candidate → dual read → guarded UI → overlay → hardening → dry run → read slot). Sob a premissa nova **"pode tocar Empresas/cadcps/modeloBase1 diretamente como beta controlado"**, parte dessa cerimônia de aproximação vira redundante como caminho crítico.

## Camadas úteis (manter)

| Camada | Papel no beta direto |
|---|---|
| Foundation C runtime (core/infra) | Motor runtime v2 — **essencial** se a tela beta for alimentada por runtime v2. |
| Empresas Shadow Pilot + Table/Form Shadow | Fonte estrutural read (colunas/campos/validação/permissão) — **essencial** para alimentar a read UI beta. |
| Read-Only Candidate + view model + write guard | Produz o modelo read-only e garante write bloqueado — **essencial** para a fase read-only do beta. |
| Controlled Dev Dataset | Dados mock controlados — **essencial** para rodar o beta sem dados reais. |
| Dual Read Compare | Paridade legado×v2 — **suporte** (validação de que a read UI beta bate com a tela atual). |
| Parity Hardening (checklist/score) | **Suporte** — vira o checklist de readiness do beta. |
| Guarded Read UI Slice/Overlay | **Suporte** — preview dev-only da read UI (útil para inspecionar antes de expor). |
| Dev Preview Route/Hub | **Suporte** — ambiente dev para abrir os previews. |

## Camadas conservadoras demais (congelar)

| Camada | Por que congelar |
|---|---|
| Read UI Bridge Dry Run | Simula uma ponte com o "bridge legado". Mas Empresas/cadcps **já rodam sobre ModeloBase1** — não há "bridge" a atravessar; a leitura beta pode entrar direto no ModeloBase1 config. A cerimônia de contrato+simulação de ponte é desnecessária para um beta direto. |
| Runtime Bridge Read Slot Candidate | Descreve um "slot de encaixe futuro" para uma ponte que não é mais o caminho. Contrato/payload/mount plan viram evidência histórica. |

**Congelar = não construir mais camadas em cima** (não remover; ficam como evidência e podem ser reaproveitados se um dia houver uma ponte real de runtime global).

## Gates: de "não tocar Empresas" para "tocar somente escopo autorizado"

Hoje o guard compartilhado `scripts/gates/lib/productionUiGuard.mjs` e ~21 gates tratam **qualquer** mudança em `src/modules/` (incl. Empresas/cadcps) e `src/App.jsx` como violação (com a única exceção da montagem dev-only da rota). Sob a premissa nova, isso está **conservador demais** para Empresas/cadcps/modeloBase1.

**Recomendação (para o próximo slice, não agora):** introduzir um **gate de escopo autorizado** que:
- **permite** mudanças em `src/modules/empresas`, `src/modules/cadcps`, `src/ModeloBase1` e `src/runtime` relacionado;
- **continua bloqueando** `src/shared`, `src/framework` (exceto pontos explícitos), `src/studio`, `src/bos`, backend, Prisma, `src/modules/makBootstrap/runtimeBridge`, e qualquer outro módulo fora do escopo;
- **mantém** `src/App.jsx` sob controle estrito (só a linha de rota/flag necessária).

Os gates atuais NÃO devem ser deletados — devem ganhar um **modo de escopo** (parâmetro/lista) para o beta, preservando a proteção sobre tudo o que continua Risco Alto.

## Risco de acelerar

- Tocar a tela real de Empresas pode introduzir regressão visual/funcional numa tela que usuários já usam (mesmo não sendo "produção crítica").
  - **Mitigação:** feature flag `MAK_MODELOBASE1_EMPRESAS_BETA` off por padrão + fallback para a config atual; `test:runtime` + gates de escopo.
- Divergência estrutural legado×v2 (já mapeada: warning de vocabulário de colunas header×dataset).
  - **Mitigação:** o dual-read/hardening já surfaça isso; resolver no wiring do ModeloBase1.

## Risco de continuar lento demais

- Continuar empilhando camadas dev-only read-only (dry run → read slot → dev activation → …) gera **custo sem valor de usuário**: nenhuma dessas camadas entrega uma tela beta funcional.
- O caminho antigo levaria ainda ~5–6 slices (dev activation → slot real → write dry run → write slot → …) para chegar a algo visível. O caminho novo chega a uma tela beta em **1 slice**.

## Conclusão

- **Manter essencial:** Foundation C, shadow/projeção, read-only candidate + view model + write guard, controlled dataset.
- **Manter suporte:** dual read, hardening (checklist), guarded UI/overlay, preview route/hub, planning.
- **Congelar:** bridge dry run, read slot candidate.
- **Ajustar gates:** de "não tocar Empresas" para "escopo autorizado (Empresas/cadcps/modeloBase1/runtime v2)".
- **Acelerar:** próximo slice = beta direto no ModeloBase1 de Empresas/Campos, atrás de flag, com fallback.
