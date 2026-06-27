# ModeloBase1 — Exceções de Certificação Aprovadas

## cadcps (Campos Personalizados)

**Status:** exceção formal aprovada — migração pendente (V9: **pode ser eliminada**, não bloqueia congelamento).

**Motivo:** módulo legado com motor imperativo próprio (`PAGCPS.jsx`, ~678 LOC) anterior à promoção ModeloBase1.

**Escopo da exceção:** apenas `cadcps`. Demais módulos de cadastro em `config/cadastro-modules.registry.json` devem usar ModeloBase1.

**Critério de remoção da exceção:** `PAGCPS.jsx` reduzido a thin page + `buildModeloBase1ConfigFromMakModule`.

---

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
