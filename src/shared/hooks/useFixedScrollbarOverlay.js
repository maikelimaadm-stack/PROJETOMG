import { useLayoutEffect } from "react";

const VARIANTS = {
  primary: {
    track: 8,
    thumb: 40,
    btn: 12,
    step: 32,
  },
  compact: {
    track: 8,
    thumb: 28,
    btn: 11,
    step: 24,
  },
};

function resolveVariant(value) {
  return VARIANTS[value] ? value : "primary";
}

function clampScroll(viewport, next) {
  const maxScroll = viewport.scrollHeight - viewport.clientHeight;
  viewport.scrollTop = Math.max(0, Math.min(maxScroll, next));
}

/**
 * Overlay com thumb de altura fixa, trilho visível e botões ▲/▼.
 */
export function useFixedScrollbarOverlay(
  viewportRef,
  thumbRef,
  trackRef,
  { variant = "primary", stepSize, upBtnRef, downBtnRef, showButtons = true } = {}
) {
  useLayoutEffect(() => {
    const viewport = viewportRef?.current;
    const thumb = thumbRef?.current;
    const track = trackRef?.current;
    const upBtn = upBtnRef?.current;
    const downBtn = downBtnRef?.current;
    if (!viewport || !thumb || !track) return undefined;

    const sizes = VARIANTS[resolveVariant(variant)];
    const scrollStep = stepSize || sizes.step;
    let rafId = 0;
    let dragging = false;
    let dragPointerId = null;
    let dragStartY = 0;
    let dragStartScroll = 0;

    const syncRail = () => {
      const { scrollTop, scrollHeight, clientHeight } = viewport;
      const maxScroll = scrollHeight - clientHeight;
      const hasScroll = maxScroll > 1;

      if (upBtn) {
        upBtn.disabled = !hasScroll || scrollTop <= 0;
        upBtn.style.opacity = hasScroll ? "1" : "0.35";
      }
      if (downBtn) {
        downBtn.disabled = !hasScroll || scrollTop >= maxScroll - 1;
        downBtn.style.opacity = hasScroll ? "1" : "0.35";
      }

      if (!hasScroll || clientHeight <= sizes.thumb) {
        track.style.opacity = "0";
        track.style.pointerEvents = "none";
        return;
      }

      track.style.opacity = "1";
      track.style.pointerEvents = "auto";

      const trackHeight = track.clientHeight;
      const maxThumbTop = Math.max(0, trackHeight - sizes.thumb);
      const ratio = maxScroll > 0 ? scrollTop / maxScroll : 0;
      thumb.style.transform = `translate3d(0, ${Math.round(ratio * maxThumbTop)}px, 0)`;
    };

    const scheduleSync = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        rafId = 0;
        syncRail();
      });
    };

    const scrollByThumbDelta = (deltaY) => {
      const { scrollHeight, clientHeight } = viewport;
      const maxScroll = scrollHeight - clientHeight;
      const maxThumbTop = track.clientHeight - sizes.thumb;
      if (maxScroll <= 0 || maxThumbTop <= 0) return;

      clampScroll(viewport, dragStartScroll + (deltaY / maxThumbTop) * maxScroll);
      scheduleSync();
    };

    const endDrag = (event) => {
      if (!dragging) return;
      dragging = false;
      if (dragPointerId !== null && thumb.hasPointerCapture?.(dragPointerId)) {
        thumb.releasePointerCapture(dragPointerId);
      }
      dragPointerId = null;
      document.body.classList.remove("erp-scroll-dragging");
      if (event) event.preventDefault();
    };

    const onThumbPointerDown = (event) => {
      if (event.button !== 0 && event.pointerType === "mouse") return;
      dragging = true;
      dragPointerId = event.pointerId;
      dragStartY = event.clientY;
      dragStartScroll = viewport.scrollTop;
      document.body.classList.add("erp-scroll-dragging");
      thumb.setPointerCapture?.(event.pointerId);
      event.preventDefault();
      event.stopPropagation();
    };

    const onThumbPointerMove = (event) => {
      if (!dragging || event.pointerId !== dragPointerId) return;
      scrollByThumbDelta(event.clientY - dragStartY);
      event.preventDefault();
    };

    const onTrackPointerDown = (event) => {
      if (event.target === thumb) return;
      if (event.button !== 0 && event.pointerType === "mouse") return;

      const rect = track.getBoundingClientRect();
      const clickY = event.clientY - rect.top;
      const { scrollHeight, clientHeight } = viewport;
      const maxScroll = scrollHeight - clientHeight;
      const maxThumbTop = track.clientHeight - sizes.thumb;
      if (maxScroll <= 0 || maxThumbTop <= 0) return;

      const thumbTop = (viewport.scrollTop / maxScroll) * maxThumbTop;
      if (clickY < thumbTop) {
        clampScroll(viewport, viewport.scrollTop - clientHeight * 0.85);
      } else if (clickY > thumbTop + sizes.thumb) {
        clampScroll(viewport, viewport.scrollTop + clientHeight * 0.85);
      }
      scheduleSync();
      event.preventDefault();
    };

    const onUpClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      if (event.detail >= 2) {
        clampScroll(viewport, 0);
      } else {
        clampScroll(viewport, viewport.scrollTop - scrollStep);
      }
      scheduleSync();
    };

    const onDownClick = (event) => {
      event.preventDefault();
      event.stopPropagation();
      const maxScroll = viewport.scrollHeight - viewport.clientHeight;
      if (event.detail >= 2) {
        clampScroll(viewport, maxScroll);
      } else {
        clampScroll(viewport, viewport.scrollTop + scrollStep);
      }
      scheduleSync();
    };

    viewport.addEventListener("scroll", scheduleSync, { passive: true });
    thumb.addEventListener("pointerdown", onThumbPointerDown);
    thumb.addEventListener("pointermove", onThumbPointerMove);
    thumb.addEventListener("pointerup", endDrag);
    thumb.addEventListener("pointercancel", endDrag);
    track.addEventListener("pointerdown", onTrackPointerDown);

    if (showButtons && upBtn) upBtn.addEventListener("click", onUpClick);
    if (showButtons && downBtn) downBtn.addEventListener("click", onDownClick);

    let resizeObserver;
    if (typeof ResizeObserver !== "undefined") {
      resizeObserver = new ResizeObserver(scheduleSync);
      resizeObserver.observe(viewport);
      resizeObserver.observe(track);
    }

    let mutationObserver;
    if (typeof MutationObserver !== "undefined") {
      mutationObserver = new MutationObserver(scheduleSync);
      mutationObserver.observe(viewport, { childList: true, subtree: true, attributes: true });
    }

    scheduleSync();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      viewport.removeEventListener("scroll", scheduleSync);
      thumb.removeEventListener("pointerdown", onThumbPointerDown);
      thumb.removeEventListener("pointermove", onThumbPointerMove);
      thumb.removeEventListener("pointerup", endDrag);
      thumb.removeEventListener("pointercancel", endDrag);
      track.removeEventListener("pointerdown", onTrackPointerDown);
      if (showButtons && upBtn) upBtn.removeEventListener("click", onUpClick);
      if (showButtons && downBtn) downBtn.removeEventListener("click", onDownClick);
      resizeObserver?.disconnect();
      mutationObserver?.disconnect();
      document.body.classList.remove("erp-scroll-dragging");
    };
  }, [viewportRef, thumbRef, trackRef, upBtnRef, downBtnRef, variant, stepSize, showButtons]);
}
