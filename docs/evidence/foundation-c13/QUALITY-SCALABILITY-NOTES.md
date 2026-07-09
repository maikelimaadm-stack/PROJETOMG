# QUALITY & SCALABILITY NOTES — FOUNDATION C.13

## Slice

Foundation C.13 — M18 Plugin Engine

## Objetivo

Explicar qualidade, escalabilidade, limites e riscos do M18 Plugin Engine.

## Escalabilidade

- **Custo de resolução de plugin por registry:** O(1) — `resolve(pluginId)` é um lookup direto (`registry.has`/`registry.resolve`) sobre o `IRegistry` já hidratado e congelado; nenhuma varredura.
- **Custo de resolução de capability:** O(1) — `getExtensionPoint(name)` e a checagem de `plugin.capabilities.includes(capability)` operam sobre um `Map`/array pequeno e local ao plugin, não sobre o conjunto global de plugins.
- **Impacto de muitos plugins declarados:** cada plugin é resolvido/carregado independentemente e sob demanda (`resolve`/`load` são chamados por `pluginId`, nunca varrem todos os plugins declarados) — o custo cresce linearmente apenas com o número de *chamadas*, não com o número total de plugins no registry.
- **Limites contra payload/capability exagerados:** o `payload` passado ao handler não é inspecionado/clonado pelo Plugin Engine (isso é responsabilidade do handler host-registrado, análogo ao Action Engine); a lista de `capabilities` de um manifest é validada quanto ao tipo (array de strings) mas não tem um teto numérico explícito neste slice — documentado como débito controlado.
- **Isolamento entre plugins:** cada plugin carregado é armazenado em uma entrada independente de um `Map` interno (`_loaded`, chaveado por `pluginId`); handlers são chaveados por `"pluginId::capability"` — um plugin nunca pode acidentalmente invocar ou sobrescrever o handler de outro.
- **O que fica para Connector/Marketplace/Plugin UI futuros:** invocação de sistemas externos reais (M19 Connector Engine, C.14), publicação/instalação de pacotes de terceiros (Marketplace, fora do Foundation C), e qualquer UI de gestão de plugins (Plugin UI) — nenhum desses existe neste slice.

## Segurança / Fail-safe

- **Plugin inexistente:** `resolve()` sobre um `pluginId` não declarado no registry sempre lança `PluginError` (`MAK-L3-PLUGIN-002`) — nunca retorna um plugin vazio/parcial.
- **Plugin inválido:** `load()` valida a shape do manifest (`pluginId` não-vazio, `capabilities` array de strings quando presente, `enabled`/`permission`/`version` com o tipo certo quando presentes) e lança `MAK-L3-PLUGIN-003` para qualquer desvio.
- **Plugin desabilitado:** `execute()` verifica `plugin.enabled` **antes** de checar permissão ou invocar qualquer handler — retorna `MAK-L3-PLUGIN-005` sem jamais rodar o handler (testado explicitamente com uma flag `executed`).
- **Capability desconhecida:** se o nome da capability nunca foi registrado como extension point pelo host (`registerExtensionPoint`), `execute()` lança `PluginError` (`MAK-L3-PLUGIN-004`) — o motor nunca assume uma capability que ele mesmo não conhece.
- **Capability não permitida:** mesmo que a capability seja um extension point conhecido do host, se o plugin específico não a declarou em `capabilities`, a execução é bloqueada (`MAK-L3-PLUGIN-006`) sem invocar o handler.
- **Permissão negada:** delegada 100% ao M09 Permission Engine (`plugin.permission` declarado) — negada bloqueia (`MAK-L3-PLUGIN-008`) antes do handler rodar.
- **Ausência de engine obrigatória:** falta do Permission Engine quando o plugin declara `permission`, ou falta de handler registrado para uma capability permitida, ambos retornam `MAK-L3-PLUGIN-007` de forma previsível — nunca executam "no escuro".
- **Bloqueio de código externo arbitrário:** o Plugin Engine nunca executa nada que não seja uma função explicitamente registrada pelo host via `registerHandler()` — o manifest em si é dado puramente declarativo (strings/booleanos), nunca código.
- **Ausência de eval/new Function/import dinâmico inseguro:** verificado por teste automatizado (com remoção de comentários JSDoc antes da checagem, para não confundir `import('./x.js').Type` — um tipo, não uma importação dinâmica — com uma chamada real de `import()`) e pelo gate G423-18, que também roda uma checagem comportamental dinâmica (capability desconhecida nunca executa silenciosamente).

## Determinismo

- **Mesma entrada produz mesmo resultado:** testado explicitamente — duas chamadas de `execute()` com o mesmo `pluginId`/`capability`/`payload` produzem `PluginResult` estritamente iguais.
- **Plugin Engine não cria side effects externos:** nenhuma escrita em disco, nenhuma chamada de rede, nenhuma mutação de estado global — apenas os `Map`s internos (`_loaded`, `_handlers`, `_extensionPoints`) e o que o handler host-registrado decidir fazer.
- **Engine só resolve/delega de forma controlada:** toda a "inteligência" de negócio de uma capability vive no handler fornecido pelo host, nunca dentro do `PluginEngine`.
- **Falha estrutural vs falha de negócio:** plugin/manifest/capability inexistentes ou malformados lançam `PluginError` (nunca produzem um resultado parcial); toda condição operacional esperada (desabilitado, não permitido, dependência ausente, permissão negada, handler falhou) é sempre retornada em `PluginResult.error`, nunca lançada.

## Códigos de erro

| Código | Significado |
|---|---|
| `MAK-L3-PLUGIN-001` | `PluginEngine` construído sem um registry válido (`IRegistry`). |
| `MAK-L3-PLUGIN-002` | Plugin inexistente no registry (`resolve()` com `pluginId` desconhecido). |
| `MAK-L3-PLUGIN-003` | Manifest com shape inválida (`load()`), ou argumento inválido em `registerExtensionPoint()`/`registerHandler()`. |
| `MAK-L3-PLUGIN-004` | Capability/extension point desconhecido — nunca registrado pelo host. |
| `MAK-L3-PLUGIN-005` | Plugin desabilitado (`enabled: false`). |
| `MAK-L3-PLUGIN-006` | Capability conhecida pelo host, mas não declarada nas `capabilities` do plugin. |
| `MAK-L3-PLUGIN-007` | Dependência obrigatória ausente — Permission Engine quando exigido, ou nenhum handler bound para a capability. |
| `MAK-L3-PLUGIN-008` | Execução negada pelo Permission Engine (M09). |
| `MAK-L3-PLUGIN-009` | O handler host-registrado lançou uma exceção durante a execução. |

## Contratos preservados

- Runtime não consulta Prisma — confirmado por teste automatizado + regex no gate G423-18.
- Runtime não consulta MMM direto — nenhuma chamada de rede/API em `core/plugin/`.
- Runtime consome registry hidratado — `PluginEngine` só usa `registry.has()`/`registry.resolve()` sobre o `IRegistry` já populado (bucket CRB `plugin`, já existente desde C.3, usado sem modificação de shape).
- UI de produção não foi alterada — `git diff --name-only origin/main...HEAD` não retorna nenhum arquivo em `src/App.jsx`, `src/shared/`, `src/framework/`, `src/modules/`, `src/studio/`.
- Studio/Marketplace não foram tocados — nenhuma alteração em `src/studio/`; nenhuma referência no código do novo módulo.
- Connector Engine não foi iniciado — nenhum diretório `core/connector/`, nenhuma classe `ConnectorEngine`.
- Transaction Engine não foi iniciado — nenhum diretório `core/transaction/`, nenhuma classe `TransactionEngine`/`TransactionManager`.
- Cache/Event Bus não foram iniciados — nenhum diretório `core/cache/` ou `core/event-bus/`, nenhuma classe `CacheEngine`/`EventBus`.

## Débitos técnicos controlados

- **Carregamento real de plugins externos fica fora do C.13:** nenhum código de terceiros é baixado, instalado, ou importado — `load()`/`resolve()` operam inteiramente sobre dados declarativos já hidratados no registry.
- **Marketplace/publicação de plugins fica fora do C.13:** nenhum fluxo de publicação, descoberta, ou instalação de plugins de terceiros existe neste slice.
- **Connector externo fica para C.14:** `RT-C-17: Plugin → Connector` (SSOT) permanece não wired — M19 Connector Engine ainda não existe.
- **Sandbox de runtime externo fica fora do C.13:** não há isolamento de processo/worker/VM para plugins — a segurança vem inteiramente do modelo declarativo (manifest = dado, comportamento = função host-registrada), não de sandboxing de execução.
- **Versionamento avançado de plugins fica para slice futuro, se aplicável:** o campo `version` do manifest é validado apenas quanto ao tipo (string não-vazia, se presente); nenhuma lógica de compatibilidade semver/range foi implementada — documentado como extensão futura, não como lacuna silenciosa.

## Conclusão

O C.13 está apto para merge do ponto de vista de qualidade: camada de extensão registry-driven e determinística, modelo de falha de duas camadas claro (estrutural=lança, negócio=retorna) consistente com o padrão já estabelecido em M10/M11/M16, execução sempre delegada a um handler host-registrado (zero código externo arbitrário, zero eval/new Function/import dinâmico), integração real com o Permission Engine, isolamento entre plugins garantido por chaveamento independente, sem persistência real, sem chamada externa, sem dependência de Prisma/MMM/backend, sem tocar UI de produção ou Studio, sem antecipar Connector Engine, Cache, Event Bus, ou Transaction Engine, com regressão completa (G423-01–17 + G423-20) verde.
