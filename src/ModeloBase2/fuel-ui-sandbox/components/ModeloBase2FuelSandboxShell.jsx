import { useMemo, useState } from 'react';
import { createModeloBase2FuelSandboxSession } from '../createModeloBase2FuelSandboxSession.js';
import { ModeloBase2FuelStatusBadges } from './ModeloBase2FuelStatusBadges.jsx';
import { ModeloBase2FuelEntryForm } from './ModeloBase2FuelEntryForm.jsx';
import { ModeloBase2FuelEntriesTable } from './ModeloBase2FuelEntriesTable.jsx';
import { ModeloBase2FuelEventTimeline } from './ModeloBase2FuelEventTimeline.jsx';
import { ModeloBase2FuelDiagnosticsPanel } from './ModeloBase2FuelDiagnosticsPanel.jsx';

/**
 * ModeloBase2FuelSandboxShell — dev-only beta sandbox shell for the fuel headless
 * candidate. Composes title, summary cards, badges, form, table, timeline and
 * diagnostics. Local-only; no backend/fetch/Prisma/runtimeBridge/storage; no real
 * side effects. NEVER mounted in the app / registered as a route/menu by this slice.
 *
 * @param {Object} props
 * @param {string} [props.moduleId]
 * @param {Object} [props.session] Injectable sandbox session (else created locally).
 */
export function ModeloBase2FuelSandboxShell({ moduleId = 'combustivel', session: injected }) {
  const session = useMemo(
    () => (injected && typeof injected.dispatchAction === 'function' ? injected : createModeloBase2FuelSandboxSession({ moduleId })),
    [injected, moduleId],
  );
  const [viewModel, setViewModel] = useState(() => session.getViewModel());
  const [diagnostics, setDiagnostics] = useState(() => session.getDiagnostics());

  const apply = (result) => {
    if (result && result.viewModel) setViewModel(result.viewModel);
    if (result && result.diagnostics) setDiagnostics(result.diagnostics);
  };

  const onNewDraft = () => apply(session.createDraft());
  const onAddEntry = (entry) => apply(session.appendEntry(entry));
  const onRemoveEntry = (entryId) => apply(session.removeEntry(entryId));
  const onValidate = () => apply(session.validateDraft());
  const onSave = () => apply(session.saveDraft());
  const onSubmit = () => apply(session.submitDraft());
  const onReset = () => apply(session.resetDraft());

  return (
    <section className="mb2-fuel-sandbox" aria-label="Fuel beta UI sandbox (dev-only)">
      <header className="mb2-fuel-sandbox__header">
        <h2 className="mb2-fuel-sandbox__title">{viewModel.title}</h2>
        <p className="mb2-fuel-sandbox__subtitle">{viewModel.subtitle}</p>
        <ModeloBase2FuelStatusBadges badges={viewModel.badges} />
      </header>

      <div className="mb2-fuel-sandbox__cards">
        {viewModel.summaryCards.map((card) => (
          <div key={card.id} className="mb2-fuel-card" data-card={card.id}>
            <span className="mb2-fuel-card__label">{card.label}</span>
            <span className="mb2-fuel-card__value">{String(card.value)}</span>
          </div>
        ))}
      </div>

      <div className="mb2-fuel-sandbox__toolbar">
        <button type="button" onClick={onNewDraft}>Novo rascunho</button>
        <button type="button" onClick={onValidate}>Validar</button>
        <button type="button" onClick={onSave}>Salvar local</button>
        <button type="button" onClick={onSubmit}>Enviar (simulado)</button>
        <button type="button" onClick={onReset}>Reset</button>
      </div>

      <ModeloBase2FuelEntryForm form={viewModel.form} onSubmit={onAddEntry} />
      <ModeloBase2FuelEntriesTable table={viewModel.table} onRemove={onRemoveEntry} />
      <ModeloBase2FuelEventTimeline timeline={viewModel.timeline} />
      <ModeloBase2FuelDiagnosticsPanel diagnostics={diagnostics} />
    </section>
  );
}

export default ModeloBase2FuelSandboxShell;
