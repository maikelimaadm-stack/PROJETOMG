export function createBusinessComputedDiagnostic(code, message, severity = "blocking", extra = {}) {
  return Object.freeze({ code, message, severity, ...extra });
}

export function validateBusinessComputedField(computedField) {
  const diagnostics = [];

  if (!computedField?.id) {
    diagnostics.push(
      createBusinessComputedDiagnostic("BCF_MISSING_ID", "Business Computed Field id is required.")
    );
  }
  if (!computedField?.businessRuleSummary) {
    diagnostics.push(
      createBusinessComputedDiagnostic(
        "BCF_MISSING_RULE",
        "Business rule summary is required.",
        "blocking"
      )
    );
  }
  if (!computedField?.ownerFieldId) {
    diagnostics.push(
      createBusinessComputedDiagnostic(
        "BCF_MISSING_OWNER_FIELD",
        "Owner field id is required.",
        "blocking"
      )
    );
  }
  if (computedField?.metadata?.studioOwned === true) {
    diagnostics.push(
      createBusinessComputedDiagnostic(
        "BCF_STUDIO_OWNED",
        "Business Computed Field must not be studio-owned.",
        "blocking"
      )
    );
  }
  if (computedField?.metadata?.belongsToBusiness !== true) {
    diagnostics.push(
      createBusinessComputedDiagnostic(
        "BCF_NOT_BUSINESS_ASSET",
        "Business Computed Field must belong to business layer.",
        "blocking"
      )
    );
  }

  return Object.freeze({
    ok: diagnostics.every((d) => d.severity !== "blocking"),
    diagnostics: Object.freeze(diagnostics),
  });
}

export default validateBusinessComputedField;
