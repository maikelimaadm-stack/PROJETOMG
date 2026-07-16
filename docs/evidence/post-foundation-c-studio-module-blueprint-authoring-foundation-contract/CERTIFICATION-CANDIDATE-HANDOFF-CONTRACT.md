# Certification Candidate Handoff Contract

`createCertificationCandidateHandoffContract()` — metadata only. In a future, separately-approved
slice, a validated draft could produce a `certificationCandidate` for **human** review.

Critical invariant: **producing a candidate is NOT certification.**

Fields: `candidateKind:'blueprint_certification_candidate'`, `candidateCreated:false`,
`candidateIsCertification:false`, `certified:false`, `canonical:false`, `readyForCertification:false`,
`requiresFutureExplicitSlice:true`, `draftSelfCertifies:false`, `overwritesCertifiedContract:false`,
`registersModule:false`, `generatesFiles:false`, `publishes:false`, `requiresHumanReview:true`,
`requiresFutureCheckpoint`, `inertData:true`.
