/** Type Coercion Engine — official single implementation (Program 2.3.4) */

export function createTypeCoercionEngine(registry, compatibility) {
  const coerceValue = (value, fromType, toType) => {
    if (fromType === toType || toType === "any" || toType === "unknown") {
      return Object.freeze({ ok: true, value, coerced: false, targetType: toType });
    }
    if (value === null || value === undefined) {
      return Object.freeze({ ok: true, value: null, coerced: false, targetType: toType });
    }

    if (!compatibility.areCompatible(fromType, toType)) {
      return Object.freeze({
        ok: false,
        value,
        coerced: false,
        targetType: toType,
        error: `Cannot coerce '${fromType}' to '${toType}'.`,
      });
    }

    try {
      if (toType === "string" || toType === "text") {
        return Object.freeze({ ok: true, value: String(value), coerced: true, targetType: toType });
      }
      if (toType === "integer") {
        const n = parseInt(String(value), 10);
        return Object.freeze({ ok: !Number.isNaN(n), value: n, coerced: true, targetType: toType });
      }
      if (toType === "decimal" || toType === "currency" || toType === "percentage") {
        const n = parseFloat(String(value));
        return Object.freeze({ ok: !Number.isNaN(n), value: n, coerced: true, targetType: toType });
      }
      if (toType === "boolean") {
        if (typeof value === "boolean") return Object.freeze({ ok: true, value, coerced: false, targetType: toType });
        const lowered = String(value).toLowerCase();
        return Object.freeze({
          ok: true,
          value: lowered === "true" || lowered === "1",
          coerced: true,
          targetType: toType,
        });
      }
      return Object.freeze({ ok: true, value, coerced: false, targetType: toType });
    } catch (err) {
      return Object.freeze({
        ok: false,
        value,
        coerced: false,
        targetType: toType,
        error: err?.message ?? "Coercion failed.",
      });
    }
  };

  return Object.freeze({
    coerce(value, fromType, toType) {
      return coerceValue(value, fromType, toType);
    },
    canCoerce(fromType, toType) {
      return compatibility.areCompatible(fromType, toType);
    },
    describeCoercion(fromType, toType) {
      const fromDef = registry?.get?.(fromType);
      return Object.freeze({
        fromType,
        toType,
        allowed: compatibility.areCompatible(fromType, toType),
        metadata: Object.freeze({
          coercionHint: fromDef?.coercibleFrom?.includes?.(toType)
            ? `Direct coercion from '${fromType}' to '${toType}' supported.`
            : compatibility.areCompatible(fromType, toType)
              ? `Widening coercion may apply.`
              : `Coercion not supported.`,
        }),
      });
    },
  });
}

export default createTypeCoercionEngine;
