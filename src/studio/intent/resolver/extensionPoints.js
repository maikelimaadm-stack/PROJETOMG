import { EXTENSION_DERIVATION_KINDS } from "../contracts/intentContracts.js";

/** Extension points — registered but not implemented in Program 3.7 */
export const RESOLVER_EXTENSION_POINTS = Object.freeze(
  EXTENSION_DERIVATION_KINDS.map((kind) =>
    Object.freeze({
      derivationKind: kind,
      status: "extension_point",
      implemented: false,
      message: "Registered for future programs — not implemented in Program 3.7.",
    })
  )
);

export function getExtensionPoint(derivationKind) {
  return RESOLVER_EXTENSION_POINTS.find((e) => e.derivationKind === derivationKind) ?? null;
}

export function assertDerivationImplemented(derivationKind) {
  const ext = getExtensionPoint(derivationKind);
  if (ext && !ext.implemented) {
    throw new Error(`Derivation kind not implemented: ${derivationKind}. Extension point only.`);
  }
}

export default RESOLVER_EXTENSION_POINTS;
