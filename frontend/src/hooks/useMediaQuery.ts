import { useEffect, useState } from 'react';

/**
 * Centralised responsive breakpoint hooks.
 *
 * Breakpoints match Tailwind defaults used across the app:
 *   Mobile:  < 640px
 *   Tablet:  640px – 1023px
 *   Desktop: ≥ 1024px
 *
 * Also treats tablet as "compact" (no permanent sidebar) since
 * 280px sidebar on a 768px tablet still consumes 37% of the width.
 *
 * Usage:
 *   const isCompact = useIsCompact();  // < 1024px — no sidebar
 *   const isMobile  = useIsMobile();   // < 640px
 */

function useMediaQueryInternal(query: string): boolean {
  // Initialise from the current window state so there is no flicker.
  const [matches, setMatches] = useState<boolean>(() => {
    if (typeof window === 'undefined') return false;
    return window.matchMedia(query).matches;
  });

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const mql = window.matchMedia(query);
    const handler = (e: MediaQueryListEvent) => setMatches(e.matches);
    mql.addEventListener('change', handler);
    // Sync in case the viewport changed between the initial render and effect
    setMatches(mql.matches);
    return () => mql.removeEventListener('change', handler);
  }, [query]);

  return matches;
}

/** True when viewport is narrower than 640 px (phone) */
export function useIsMobile(): boolean {
  return useMediaQueryInternal('(max-width: 639px)');
}

/** True when viewport is 640 px – 1023 px (tablet) */
export function useIsTablet(): boolean {
  return useMediaQueryInternal('(min-width: 640px) and (max-width: 1023px)');
}

/** True when viewport is at least 1024 px (desktop) */
export function useIsDesktop(): boolean {
  return useMediaQueryInternal('(min-width: 1024px)');
}

/**
 * True when viewport is narrower than 1024 px.
 * This is the primary gate for hiding the permanent sidebar and topbar
 * and showing the MobileTopbar + MobileNavDrawer instead.
 */
export function useIsCompact(): boolean {
  return useMediaQueryInternal('(max-width: 1023px)');
}
