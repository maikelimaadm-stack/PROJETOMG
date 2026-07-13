# Quality & Scalability Notes

- **Determinismo:** todos os digests são FNV-1a (`fnv1a-8hex`) sobre entradas
  normalizadas e ordenadas; entradas idênticas → digests idênticos.
- **Pureza:** nenhuma função tem efeito colateral; `safeCloneGenericModel` faz round-trip
  JSON e descarta funções, garantindo saídas serializáveis.
- **Fail-closed:** flags falham fechadas em produção sem escape; permissões de mutação
  nunca iniciam habilitadas; fallback sempre `safeToEmit: false`.
- **Reuso do certificado:** validação de campo delega à matriz de hardening certificada,
  evitando divergência de regras.
- **Escalabilidade:** a pipeline é O(n) no número de campos; comparação e compatibilidade
  são O(n) com mapas por nome; nada carrega I/O ou rede.
- **Reversibilidade:** nada é auto-consumido pela app; remover o subtree remove o engine
  (rollback por não-consumo).
