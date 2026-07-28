# Semântica do limite de array

`maxSourceDecisionFields` (33) significa **campos top-level da `bridgeDecision`** — nunca elementos de um array aninhado. A checagem `array.length > maxSourceDecisionFields` foi removida.

Provado aceito: array denso de 33, 34, 40, 128 e 512 itens seguros, dentro de bytes/depth/string.

Continuam rejeitados: sparse, accessor em índice, `length` accessor, proxy hostil (lido só por descritor), propriedade própria extra no array e pollution key.

## Preflight

O único preflight de comprimento é um budget **matematicamente implicado** por `maxSourceDecisionBytes`: na serialização canônica cada elemento custa no mínimo um byte mais um separador, logo um array acima de `maxSourceDecisionBytes / 2` não pode caber no teto real de bytes. Nenhuma dimensão contratual nova foi criada e o número 33 não é usado. Os limites reais de bytes, profundidade e string decidem depois.
