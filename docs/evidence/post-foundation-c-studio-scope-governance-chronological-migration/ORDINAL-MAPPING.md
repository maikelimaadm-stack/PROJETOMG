# Ordinal mapping

O ordinal é a única fonte de cronologia. Ele responde à pergunta que o registry plano não conseguia responder: **um caminho registrado é realmente POSTERIOR a quem está perguntando?**

## Regra

```
active.sliceOrdinal >= caller.sliceOrdinal   → cronologia aceitável
active.sliceOrdinal <  caller.sliceOrdinal   → active_slice_before_caller (bloqueia)
```

## Por que o desenho anterior falhava

`isKnownLaterStudioHeadlessArtifact(path)` recebia apenas o caminho. Ele respondia "esse caminho está registrado?", não "esse caminho é posterior a mim?". Qualquer artefato registrado — inclusive um de fatia ANTERIOR — era tolerado por qualquer chamador. A regra "nenhum teste/gate anterior alterado" ficava enfraquecida em vez de satisfeita.

## Ordem verificada no teste

```
module-preview-sandbox              <  dev-preview-contract-bridge
dev-preview-app-integration         <  module-blueprint-authoring-foundation-contract
module-blueprint-authoring-runtime  <  authoring-runtime-to-preview-bridge-contract
authoring-runtime-to-preview-bridge <  bridge-to-preview-sandbox-runtime-contract
builder-contract                    <  builder-implementation-plan
builder-implementation-plan         <  bridge-decision-core-envelope-builder
bridge-decision-core-envelope-builder < studio-scope-governance-chronological-migration
```

Os ordinais são contíguos de 1 a N, então não existe buraco silencioso onde uma fatia possa ser inserida sem decisão explícita.
