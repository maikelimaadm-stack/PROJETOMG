/**
 * API imperativa de confirmação — registrada em runtime pelo ErpConfirmProvider.
 * Uso: const ok = await confirmAction({ title, message, variant: 'destructive' });
 */

let confirmHandler = null;

export function registerConfirmAction(handler) {
  confirmHandler = handler;
}

export async function confirmAction(options = {}) {
  if (!confirmHandler) {
    console.warn("[confirmAction] Provider não montado — retornando false.");
    return false;
  }
  return confirmHandler(options);
}
