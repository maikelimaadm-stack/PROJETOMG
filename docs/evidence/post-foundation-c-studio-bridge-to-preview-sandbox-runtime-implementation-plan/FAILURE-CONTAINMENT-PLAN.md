# Failure Containment Plan

- atomicDecision: true
- targetNullOnBlocker: true
- partialSandboxDescriptorAllowed: false
- sourceMutationAllowed: false
- sideEffectsAllowed: false
- rollbackByNonConsumption: true
- unexpectedExceptionFailsClosed: true
- sanitizedEmergencyRejection: true
- stackLeakAllowed: false
- messageLeakAllowed: false
- causeLeakAllowed: false
- secretLeakAllowed: false
- issueCode: RUNTIME_UNEXPECTED_EXECUTION_FAILURE
- failureContainmentImplemented: false
