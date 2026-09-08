# Matriz de testes da fatia

| seção | tema |
|-------|------|
| C | catálogo: 47 entradas, ordinais contíguos, ids únicos, entradas 1..46 intactas |
| A | autorização: 14 cross exatos, zero wildcard, zero forbidden |
| B | boundary: matriz positiva non-Studio |
| N | matriz negativa: mixed, unknown, forbidden, core |
| E | diff vazio continua `empty_branch_diff` |
| H | higiene: nenhum skip/todo/only, nenhum bypass por env ou nome de branch nos 14 corrigidos |
| R | regressão: todo consumidor corrigido reconhece `non_studio_branch` e o prova |
