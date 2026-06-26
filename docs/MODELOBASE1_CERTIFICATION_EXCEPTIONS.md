# ModeloBase1 — Exceções de Certificação Aprovadas

## cadcps (Campos Personalizados)

**Status:** exceção formal aprovada — migração pendente.

**Motivo:** módulo legado com motor imperativo próprio (`PAGCPS.jsx`, ~678 LOC) anterior à promoção ModeloBase1.

**Escopo da exceção:** apenas `cadcps`. Demais módulos de cadastro em `config/cadastro-modules.registry.json` devem usar ModeloBase1.

**Critério de remoção da exceção:** `PAGCPS.jsx` reduzido a thin page + `buildModeloBase1ConfigFromMakModule`.

---

## Componentes framework/cadastro com prefixo Emp*

**Status:** exceção técnica temporária — naming debt.

**Arquivos:** `EmpTablePagination`, `EmpConfiguracaoColunasDialog`, `EmpConfigDialogKit`, etc.

**Motivo:** componentes compartilhados pré-promoção; renomeação em massa fora do escopo desta certificação sem quebra de imports.

**Requisito:** nenhum módulo possui cópia local; todos consomem framework/cadastro ou ModeloBase1.
