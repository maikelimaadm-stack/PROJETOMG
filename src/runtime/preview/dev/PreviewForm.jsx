/**
 * Dev-only presentational component — renders the STRUCTURE of the runtime v2
 * form projection (fields + labels + required + permission + validation
 * metadata). It never renders editable inputs bound to real data, never
 * saves, never executes anything.
 */
export function PreviewForm({ form }) {
  const fields = Array.isArray(form?.fields) ? form.fields : [];
  return (
    <section className="mak-dev-preview-form" data-testid="dev-preview-form">
      <h3 className="text-sm font-semibold">Form Preview</h3>
      <ul className="text-xs">
        {fields.map((f) => (
          <li key={f.id} data-field={f.id} className={f.denied ? 'mak-dev-preview-denied' : undefined}>
            <span className="mak-dev-preview-label">{f.label}</span>
            <span className="mak-dev-preview-meta">
              {` [${f.type}]`}
              {f.required ? ' [required]' : ''}
              {f.permission ? ` [perm: ${f.permission}]` : ''}
              {f.denied ? ' [denied]' : ''}
              {f.validationRules.length > 0 ? ` [rules: ${f.validationRules.join(', ')}]` : ''}
            </span>
          </li>
        ))}
      </ul>
    </section>
  );
}

export default PreviewForm;
