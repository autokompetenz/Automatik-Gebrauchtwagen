import { useState, useEffect } from 'react';

/**
 * useBreakpoint — returns current viewport info
 * isMobile  : < 768px
 * isTablet  : 768px – 1023px
 * isDesktop : ≥ 1024px
 */
export function useBreakpoint() {
  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );

  useEffect(() => {
    const handler = () => setWidth(window.innerWidth);
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  return {
    width,
    isMobile:  width < 768,
    isTablet:  width >= 768 && width < 1024,
    isDesktop: width >= 1024,
  };
}
