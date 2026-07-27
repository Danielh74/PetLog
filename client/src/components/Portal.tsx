import { useEffect, type ReactNode } from 'react';
import { createPortal } from 'react-dom';

/**
 * Renders overlays into <body>.
 *
 * Sheets, dialogs and toasts are all `position: fixed`, which is only relative
 * to the viewport when no ancestor establishes a containing block. `.page`
 * animates a `transform`, and a transformed ancestor does exactly that — so an
 * overlay rendered in place was being positioned against the page instead of
 * the window: off-centre on desktop, off-screen on mobile.
 *
 * Body scroll is locked while an overlay is up so the page behind does not
 * slide when a mobile user drags over the scrim.
 */
const Portal = ({ children, lockScroll = false }: { children: ReactNode; lockScroll?: boolean }) => {
  useEffect(() => {
    if (!lockScroll) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = previous;
    };
  }, [lockScroll]);

  return createPortal(children, document.body);
};

export default Portal;
