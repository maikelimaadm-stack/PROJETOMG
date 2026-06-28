# ModeloBase1 — Exceções de Certificação Aprovadas

## Componentes framework/cadastro com prefixo Emp*

**Status:** exceção técnica **definitiva** (V9 confirmado).

**Arquivos:** `EmpTablePagination`, `EmpConfiguracaoColunasDialog`, `EmpConfigDialogKit`, etc.

**Motivo:** componentes compartilhados pré-promoção; renomeação em massa fora do escopo desta certificação sem quebra de imports.

**Requisito:** nenhum módulo possui cópia local; todos consomem framework/cadastro ou ModeloBase1.

---

## Gerador de módulos (Enterprise V9)

**Status:** gerador oficial certificado (gates G103–G108).

**Padrão:** ModeloBase1 config-only (thin page + factory). Scaffold legado FORM/TBL eliminado.

**Comando:** `npm run generate:module`

---

## Governança permanente (Enterprise V10)

**Status:** ativa — CI bloqueia regressões arquiteturais.

**Gates:** G109–G126 (`npm run gate:governance`)

**Documentação:** `docs/FOUNDATION_GOVERNANCE.md`

**Baseline:** `scripts/governance-baseline.json`

**Regra:** alteração arquitetural = exceção formal neste documento.

---

## cadcps — migração concluída

**Status:** certificado como consumidor ModeloBase1 (sem exceção legada).

**Referência:** `src/modules/cadcps/pages/PAGCPS.jsx` (thin page) + `cadcpsModeloBase1Config.js`.

---

## fieldcert — módulo fictício V14 (Field Configuration Engine)

**Status:** exceção formal — certificação metadata-only, sem rota App.

**Motivo:** módulo fictício da Missão Enterprise V14 para demonstrar todos os tipos de campo via metadata (`MAK_FIELD_CERTIFICATION_CATALOG`).

**Referência:** `src/modules/fieldcert/` + `framework/mak/fieldConfig/fieldCertificationCatalog.js`.

---

## validationcert — módulo fictício V16 (Validation Configuration Engine)

**Status:** exceção formal — certificação metadata-only, sem rota App.

**Motivo:** módulo fictício da Missão Enterprise V16 para demonstrar validações declarativas via metadata (`MAK_VALIDATION_CERTIFICATION_CATALOG`).

**Referência:** `src/modules/validationcert/` + `framework/mak/validation/validationCertificationCatalog.js`.

---

## formulacert — módulo fictício V17 (Formula Configuration Engine)

**Status:** exceção formal — certificação metadata-only, sem rota App.

**Motivo:** módulo fictício da Missão Enterprise V17 para demonstrar fórmulas declarativas via metadata (`MAK_FORMULA_CERTIFICATION_CATALOG`).

**Referência:** `src/modules/formulacert/` + `framework/mak/formula/formulaCertificationCatalog.js`.
