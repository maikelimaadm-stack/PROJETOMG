# WRITE CAPABILITY REFERENCE MATRIX

`createEmpresasWriteCapabilityReferenceMatrix()` — read certificado; escritas
reference-only / future-controlled.

| capability | currentStatus | allowedInThisSlice | risk |
| --- | --- | --- | --- |
| read | certified | sim | low |
| create | reference_only | não | dangerous_if_default_open |
| update | reference_only | não | dangerous_if_default_open |
| delete | reference_only | não | dangerous_if_default_open (safeDefault blocked) |
| export | inferred | não | low |
| configure | needs_alignment | não | low |
| diagnostics | inferred | não | low |

Regras: mutationAllowed false · productionWrite false · deleteEnabledByDefault false ·
permissionsAltered false · endpointCalled false · nenhuma escrita permitida neste slice.
