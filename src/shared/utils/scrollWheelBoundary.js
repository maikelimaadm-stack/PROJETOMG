/**
 * Verifica se o ponteiro está sobre a barra de rolagem nativa do elemento.
 */
export function isPointerOverScrollbar(element, clientX) {
  if (!(element instanceof HTMLElement)) return false;

  const scrollbarWidth = element.offsetWidth - element.clientWidth;
  if (scrollbarWidth <= 0) return false;

  const rect = element.getBoundingClientRect();
  return clientX >= rect.right - scrollbarWidth - 1;
}

/**
 * Isola wheel no container rolável: rola normalmente e só bloqueia chain nos limites.
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

  const list =
    panel.querySelector(`${listSelector} .erp-scroll-nav__viewport`) ||
    panel.querySelector(`${listSelector}.erp-scrollbar`) ||
    panel.querySelector(listSelector);
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
