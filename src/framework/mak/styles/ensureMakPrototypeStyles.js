let loadPromise = null;

/** Carrega mg-prototype.css sob demanda (rotas MAK/Empresas). Idempotente. */
export function ensureMakPrototypeStyles() {
  if (!loadPromise) {
    loadPromise = import("@/styles/mg-prototype.css");
  }
  return loadPromise;
}
