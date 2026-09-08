# Por que a Slice 47 é necessária

A correção toca 14 arquivos de teste que pertencem a **14 fatias diferentes**,
todas com `status: 'merged'`.

Medição na branch de implementação, antes da entrada 47 existir:

```
resolveActiveStudioSlice(diff) → ok: false · candidates: []
consumer                       → safe: false
                                 reason: no_active_slice_resolved
                                 blockers: [no_active_slice_resolved, unknown_scope]
unknown: 14 caminhos
```

Nenhuma entrada existente resolve esta branch, e nenhuma pode: uma fatia mergeada
descreve o que **aquela** fatia fez. Enfiar 14 artefatos estranhos na lista de
cross-authorization de uma fatia mergeada falsificaria a propriedade dela e
violaria a imutabilidade da evidência histórica.

Portanto a única representação legítima é uma fatia corretiva própria.

## Mínima por construção

- 14 padrões cross, um por arquivo, todos ancorados em `^...$` — zero wildcard;
- zero autorização de caminho proibido;
- marker estreito: apenas esta pasta de evidência;
- artefatos primários: apenas o teste e o gate desta fatia;
- guard em `shared`, nunca em `cross` — porque esta fatia **não o altera**;
- entradas 1..46 intocadas; catálogo não renumerado.
