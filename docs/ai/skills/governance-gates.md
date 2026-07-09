# Skill — Governança & Gates (portável)

**Substitui no Cursor:** verification skill, CI context  
**Use quando:** PR, certificação, Foundation C gate, verify:governance

---

## Hierarquia de documentos (conflito)

1. Constitution `docs/constitution/`
2. DECISIONS.md
3. PROJECT-STATUS.md
4. ROADMAP.md
5. CURRENT-STATE.md
6. Chat (nunca autoritativo)

## Antes de PR

```bash
npm run lint
npm run build
npm run test:runtime          # se mexeu em src/runtime/
npm run verify:governance     # foundation + capabilities
# ou mirror CI completo:
npm run verify:ci
```

## Foundation C — gates runtime

| Gate | Módulo | Script |
|------|--------|--------|
| G423-01 | Bootstrap | `npm run gate:g423-01` |
| G423-02 | Context | `npm run gate:g423-02` |
| G423-03 | Session | `npm run gate:g423-03` |
| G423-04 | Registry | `npm run gate:g423-04` |
| G423-05 | Loader | `npm run gate:g423-05` |
| G423-06 | CRB | `npm run gate:g423-06` |
| G423-07 | Dependency | `npm run gate:g423-07` |
| G423-08 | Router | `npm run gate:g423-08` |
| G423-09 | Permission | C.5 ⏳ |
| G423-20 | Service Locator | C.5 ⏳ |
| **G423** | RT-0→RT-8 master | C.17 ⏳ |

**Regra slice:** gate novo PASS + regressão de todos anteriores.

## Certificação por slice

Criar `docs/evidence/foundation-cN/CERTIFICATION-REPORT.md` com tabela:

- Arquivos modificados
- Linhas
- Módulos
- Gates
- Testes
- Contratos
- Decisões alteradas (Nenhuma)
- Débito
- Métricas
- Próximo slice

## PIP — 10 fases

Ver `docs/engineering/PLATFORM-IMPLEMENTATION-PROTOCOL.md`

Inclui **RHP** (Repository Health Protocol) início/fim de missão.

## D-028 / D-029

- 10 perguntas impacto enterprise antes de implementar
- 18 Engineering Principles obrigatórios

## Foundation freeze (D-052)

Não adicionar camadas Studio/Foundation sem nova Decision + gate.

## CI

`.github/workflows/foundation-governance.yml`

## Registries

- `docs/engineering/GOVERNANCE-REGISTRY.md`
- `docs/engineering/GATE-REGISTRY.md`

## Config engines (V13–V20)

Gates G156–G261 — em CI via `gate:capabilities`.

## O que atualizar após missão

| Doc | Quando |
|-----|--------|
| CURRENT-STATE.md | Sempre |
| PROJECT-STATUS.md | Program/version mudou |
| DECISIONS.md | Novo D-XXX |
| README_AI.md § status | Campos mudaram |
| Handoff | Após slice mergeado |

## Equivalente Cursor

| Cursor | Ação |
|--------|------|
| verification skill | `npm run verify:ci` |
| Cloud Agent PR rules | branch `cursor/*-0b52`, 1 slice/PR |
| Bugbot / security-review | rodar manualmente antes de merge crítico |
