import { RuntimeV2DevPreviewModuleCard } from './RuntimeV2DevPreviewModuleCard.jsx';

/**
 * Dev-only panel — renders the hub status and one card per module. Purely
 * presentational; nothing here executes or fetches.
 */
export function RuntimeV2DevPreviewHubPanel({ hubModel }) {
  const model = hubModel ?? {};
  const modules = Array.isArray(model.modules) ? model.modules : [];
  const diagnostics = model.diagnostics ?? {};

  return (
    <div className="mak-dev-hub-panel" data-testid="dev-hub-panel">
      <section className="mak-dev-hub-status" data-testid="dev-hub-status">
        <p className="text-xs">
          {`environment: ${model.environment ?? 'unknown'}`}
          {` · modules: ${modules.length}`}
          {` · available: ${diagnostics.availableModules ?? 0}`}
        </p>
        <ul className="text-xs">
          {(model.warnings ?? []).map((w, i) => (
            <li key={`hw-${i}`}>{w}</li>
          ))}
        </ul>
      </section>

      <section className="mak-dev-hub-cards" data-testid="dev-hub-cards">
        {modules.map((m) => (
          <RuntimeV2DevPreviewModuleCard key={m.moduleId} module={m} />
        ))}
      </section>
    </div>
  );
}

export default RuntimeV2DevPreviewHubPanel;
