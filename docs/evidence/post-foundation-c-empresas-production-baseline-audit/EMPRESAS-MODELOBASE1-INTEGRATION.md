# Empresas — ModeloBase1 Integration

Auditoria de como Empresas consome ModeloBase1 (nenhum arquivo alterado).

## Consumo exclusivo via builder

`config/modeloBase1/empresasModeloBase1Config.js`:

```
export const empresasModeloBase1Config = buildModeloBase1ConfigFromMakModule(empresasMakModule, {
  runtimeReadModel: empresasBetaReadModel,   // null quando a flag beta está off
  scopeCssClass, tableKey: "tbl-emp", preferencesAdapter, customFields,
  moduleDefinition, components, labels, hooks, data, helpers, export,
});
```

- Empresas é um **consumidor exclusivo** de ModeloBase1 via `buildModeloBase1ConfigFromMakModule`.
- A página (`PAGEMP.jsx`) só injeta a config; o motor de render/tabela/form vive em ModeloBase1.

## runtimeReadModel (runtime v2, direct-beta, READ-ONLY)

```
const empresasBetaReadModel = isEmpresasModeloBase1BetaEnabled()
  ? createEmpresasModeloBase1BetaReadModel()
  : null;
```

- Injetado **apenas** quando `MAK_MODELOBASE1_EMPRESAS_BETA` está ligado (dev-only, fail-closed em
  produção).
- Flag off → `null` → **sem chave `runtimeReadModel`** → fallback para a config atual,
  **byte-idêntico** ao comportamento pré-beta. **Reversível por flag.**
- Fonte: `@/runtime/modelobase1-direct-beta/createEmpresasModeloBase1BetaReadModel.js` +
  `modeloBase1DirectBetaConfig.js`.

## Fallback

- O fallback é o próprio caminho atual: quando não há `runtimeReadModel`, ModeloBase1 usa a config
  clássica (repository + API). Não há degradação de UI.

## Diagnostics / flags

- Flag: `MAK_MODELOBASE1_EMPRESAS_BETA` (+ variantes campos). Off por padrão, fail-closed em produção.
- Diagnostics/paridade cobertos por testes de migração (shadow-compare, parity-hardening,
  runtime-bridge dry-run) — ver RISK-REGISTER.

## Relação com cadcps / campos personalizados

- Campos personalizados (`campos_personalizados` no modelo Prisma; `CadCpsCampo*` no schema) fluem
  via `empresasCustomFieldsConfig` e `formEmp.customFields.jsx`.
- cadcps é um módulo irmão que compartilha o kernel genérico (`empresas-cadcps-consuming-generic-kernel`).

## Generic kernel

- Empresas/cadcps já consomem o generic-model kernel via ModeloBase1 (slice anterior mergeado).

## Risco de regressão

- **Baixo com a flag off** (byte-idêntico). **Médio com a flag on** — mitigado pela bateria de
  testes de paridade/shadow já existente.

## Oportunidades de hardening

- Promover o `runtimeReadModel` beta de dev-only para um piloto de produção **controlado** (read-only
  primeiro), atrás de gate próprio e test plan — **assunto do próximo slice, não deste**.
- Expandir a cobertura de paridade para escrita (create/update/delete) antes de qualquer piloto de
  escrita.
