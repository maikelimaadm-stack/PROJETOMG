import { useState } from 'react';

/**
 * ModeloBase2FuelEntryForm — dev-only sandbox fuel entry form. Presentational and
 * controlled locally; on submit it calls `onSubmit(entry)` with a plain fuel entry.
 * NO backend/fetch/Prisma/runtimeBridge/storage; no real side effects. Never mounted
 * in the app by this slice.
 *
 * @param {Object} props
 * @param {{ fields: Array<{ id: string, label: string, type?: string, required?: boolean }> }} props.form
 * @param {(entry: Object) => void} [props.onSubmit]
 * @param {boolean} [props.disabled]
 */
export function ModeloBase2FuelEntryForm({ form, onSubmit, disabled = false }) {
  const fields = form && Array.isArray(form.fields) ? form.fields : [];
  const [values, setValues] = useState({});

  const setField = (id, raw, type) => {
    const value = type === 'number' ? (raw === '' ? undefined : Number(raw)) : raw;
    setValues((prev) => ({ ...prev, [id]: value }));
  };

  const submit = (event) => {
    if (event && typeof event.preventDefault === 'function') event.preventDefault();
    if (typeof onSubmit === 'function') onSubmit({ ...values });
  };

  return (
    <form className="mb2-fuel-form" onSubmit={submit}>
      {fields.map((f) => (
        <label key={f.id} className="mb2-fuel-form__field" data-field={f.id}>
          <span className="mb2-fuel-form__label">{f.label}{f.required ? ' *' : ''}</span>
          <input
            className="mb2-fuel-form__input"
            type={f.type === 'number' ? 'number' : (f.type === 'date' ? 'date' : 'text')}
            value={values[f.id] === undefined || values[f.id] === null ? '' : values[f.id]}
            onChange={(e) => setField(f.id, e.target.value, f.type)}
            disabled={disabled}
          />
        </label>
      ))}
      <button className="mb2-fuel-form__submit" type="submit" disabled={disabled}>
        Adicionar lançamento
      </button>
    </form>
  );
}

export default ModeloBase2FuelEntryForm;
