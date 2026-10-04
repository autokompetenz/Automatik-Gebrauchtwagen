import { useState, useEffect } from 'react';

/**
 * useMediaQuery — Custom hook for media queries
 * 
 * Usage:
 * const isMobile = useMediaQuery('(max-width: 767px)');
 * const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
 * const prefersDark = useMediaQuery('(prefers-color-scheme: dark)');
 */
export function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia(query);
    setMatches(mediaQuery.matches);

    const handleChange = (e) => setMatches(e.matches);
    mediaQuery.addEventListener('change', handleChange);

    return () => {
      mediaQuery.removeEventListener('change', handleChange);
    };
  }, [query]);

  return matches;
}

/**
 * useMediaQueries — Multiple media queries at once
 * 
 * Returns object with boolean values for each query
 */
export function useMediaQueries(queries) {
  const results = {};
  
  Object.keys(queries).forEach(key => {
    // eslint-disable-next-line react-hooks/rules-of-hooks
    results[key] = useMediaQuery(queries[key]);
  });

  return results;
}

/**
 * Predefined common media queries
 */
export const MEDIA_QUERIES = {
  mobile: '(max-width: 767px)',
  tablet: '(min-width: 768px) and (max-width: 1023px)',
  desktop: '(min-width: 1024px)',
  smallDesktop: '(min-width: 1024px) and (max-width: 1439px)',
  largeDesktop: '(min-width: 1440px)',
  landscape: '(orientation: landscape)',
  portrait: '(orientation: portrait)',
  highDPI: '(-webkit-min-device-pixel-ratio: 2), (min-resolution: 192dpi)',
  reducedMotion: '(prefers-reduced-motion: reduce)',
  touch: '(hover: none) and (pointer: coarse)',
  mouse: '(hover: hover) and (pointer: fine)',
};
