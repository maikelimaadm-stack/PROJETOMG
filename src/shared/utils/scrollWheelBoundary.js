/**
 * Isola wheel no container rolável: rola normalmente e só bloqueia chain nos limites.
 * Mantém o scroll alinhado ao cursor (sem capturar wheel no container pai).
 */
export function isolateScrollWheel(event) {
  const el = event.currentTarget;
  if (!(el instanceof HTMLElement)) return;

  const delta = event.deltaY;
  if (delta === 0) return;

  const maxScroll = el.scrollHeight - el.clientHeight;
  if (maxScroll <= 0) {
    event.stopPropagation();
    return;
  }

  const atTop = el.scrollTop <= 0;
  const atBottom = el.scrollTop >= maxScroll - 1;

  if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
    event.stopPropagation();
  }
}

/**
 * Painel flutuante: wheel na lista interna rola a lista; fora dela não vaza para o fundo.
 */
export function isolateFloatingPanelWheel(event, listSelector) {
  const panel = event.currentTarget;
  if (!(panel instanceof HTMLElement)) return;

  const list = panel.querySelector(listSelector);
  if (list instanceof HTMLElement && list.contains(event.target)) {
    const delta = event.deltaY;
    if (delta === 0) return;

    const maxScroll = list.scrollHeight - list.clientHeight;
    if (maxScroll <= 0) {
      event.stopPropagation();
      return;
    }

    const atTop = list.scrollTop <= 0;
    const atBottom = list.scrollTop >= maxScroll - 1;

    if ((delta < 0 && atTop) || (delta > 0 && atBottom)) {
      event.stopPropagation();
    }
    return;
  }

  event.stopPropagation();
  event.preventDefault();
}
