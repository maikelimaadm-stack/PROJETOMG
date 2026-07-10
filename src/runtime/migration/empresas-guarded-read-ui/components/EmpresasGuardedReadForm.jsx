/**
 * Dev-only, READ-ONLY presentational form for the Empresas guarded read UI
 * slice. It renders the runtime v2 view-model fields in a disabled/readOnly
 * visual state. There is NO submit, NO save, NO update, NO delete, and no
 * handler with a side effect. Pure props → markup.
 *
 * @param {Object} props
 * @param {import('../../../types/empresas-readonly-runtime-v2.js').EmpresasReadOnlyViewModel['form']} [props.form]
 */
export function EmpresasGuardedReadForm({ form }) {
  const fields = Array.isArray(form?.fields) ? form.fields : [];
  return (
    <section className="mak-guarded-read-form" data-testid="empresas-guarded-read-form" aria-readonly="true">
      <h3 className="text-sm font-semibold">Empresas — Formulário (read-only)</h3>
      <dl className="text-xs">
        {fields.map((f) => (
          <div key={f.id} data-field={f.id} className="mak-guarded-read-field">
            <dt>
              {f.label ?? f.id}
              {f.required ? ' *' : ''}
              {f.denied ? ' [sem permissão]' : ''}
            </dt>
            <dd>
              <input
                type="text"
                value=""
                readOnly
                disabled
                aria-readonly="true"
                data-field-type={f.type}
                placeholder={`${f.type ?? 'text'} (read-only)`}
              />
            </dd>
          </div>
        ))}
      </dl>
      <p className="mak-guarded-read-note text-xs">Somente leitura — sem salvar, sem editar, sem excluir.</p>
    </section>
  );
}

export default EmpresasGuardedReadForm;
