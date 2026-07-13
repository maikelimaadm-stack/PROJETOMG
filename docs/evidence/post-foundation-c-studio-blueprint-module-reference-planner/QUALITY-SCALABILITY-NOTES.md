# Quality & Scalability Notes

- **Determinismo:** todos os digests são FNV-1a (`fnv1a-8hex`) sobre planos ordenados;
  entradas idênticas → digests idênticos.
- **Pureza:** nenhuma função tem efeito colateral; `safeCloneGenericModel` garante saídas
  serializáveis (descarta funções).
- **Fail-closed:** flags falham fechadas em produção; permissões de mutação nunca iniciam
  habilitadas; fallback sempre `safeToUseAsModuleReferencePlan:false`.
- **Reuso do engine:** o planner consome o Studio Blueprint Engine para validar o
  blueprint, evitando divergência de regras.
- **Escalabilidade:** O(n) no número de campos; comparações e agregações por mapa; sem
  I/O ou rede.
- **Reversibilidade:** nada é auto-consumido; remover o subtree remove o planner (rollback
  por não-consumo).
- **Observações ambientais:** `gate:paridade-visual` (spawnSync ENOENT) permanece
  ambiental e fora do escopo deste slice; Vercel Ready/Building é informativo.
