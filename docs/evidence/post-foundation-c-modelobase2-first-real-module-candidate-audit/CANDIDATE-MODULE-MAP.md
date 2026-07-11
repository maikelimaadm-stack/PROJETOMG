# Candidate Module Map

## Método

Buscas por palavras-chave operacionais (`combust`, `fuel`, `abastec`, `litros`, `horimetro`,
`pesag`, `peso`, `balanc`, `gado`, `boi`, `animal`, `apont`, `lancament`, `diario`, `ordem`,
`offline`) em `src`, `electron`, `scripts`, `package.json`, e inspeção de `src/modules/`,
`src/apis/`, `src/modules/generatedModules.json`.

## Descoberta crítica

**Não existe nenhum módulo real de Combustível, Pesagem ou Apontamento no código.** Os únicos
módulos reais registrados são **cadastro** (ModeloBase1):

| moduleId | rota | tipo | pageFile |
|---|---|---|---|
| `empresas` | `/CadastroEmpresas` | cadastro | `modules/empresas/pages/PAGEMP.jsx` |
| `cadcps` | `/CadastroCamposPersonalizados` | cadastro | `modules/cadcps/pages/PAGCPS.jsx` |

Fonte: `src/modules/generatedModules.json`.

Outras pastas em `src/modules/`: `actionscert`, `eventscert`, `fieldcert`, `formulacert`,
`validationcert`, `workflowcert` (scaffolding de certificação), `template` (template de scaffold),
`makBootstrap` (bootstrap). **Nenhuma é operacional.**

## Falsos positivos das buscas (importante)

| termo | onde apareceu | por quê NÃO é candidato |
|---|---|---|
| `combust`/`fuel`/`litros` | `src/ModeloBase2/**`, testes | **fixtures do próprio ModeloBase2** (`moduleId:'combustivel'`, `values:{litros}`) |
| `pesag`/`peso` | testes MB2, `src/index.css`, `erp-responsive.css` | fixtures MB2 + `font-weight` (peso da fonte) no CSS |
| `balanc` | `empFormRowBalance.js`, layouts | **flex "balance"** de layout, não balança |
| `gado` (49) | `logado`/`carregado`/`delegado`/`legado` | **substring** de particípios em pt-BR, não "gado" (bovino) |
| `ordem` (28) | preferences/configurators | **ordem de colunas/campos**, não ordem de serviço |
| `apont`/`lancament` | `src/ModeloBase2/**`, testes, preferences | fixtures MB2 + termos genéricos |
| `offline` | `src/ModeloBase2/**`, `AuthApi.js` | fixtures MB2 + comentário |

## Backend surface (src/apis/)

`anexos`, `auth`, `cadcps`, `clienteModulo`, `empresa`, `history`, `http`, `import`, `metrics`,
`preferences`. **Todas cadastro/suporte** — nenhuma operacional (sem fuel/weighing/entry API).

## Electron / storage

- `electron/` **não existe**.
- Nenhum uso de `IndexedDB`/`localStorage` obrigatório para um fluxo operacional (as buscas só
  acharam preferences/framework genéricos).

## Conclusão do mapa

Os três candidatos nomeados (Combustível, Pesagem, Apontamento) são **greenfield** — não há código
existente a "conectar". A escolha do primeiro candidato é, portanto, sobre **qual novo domínio
operacional headless construir primeiro** sobre o ModeloBase2 Operational Runtime, e não sobre
adaptar um módulo já existente. Isso **reduz** o risco de regressão (não há tela/serviço real a
quebrar), desde que o próximo slice permaneça headless e local.
