import { useState, useEffect, useCallback } from 'react';

/**
 * useResponsive — Advanced responsive hook with breakpoint management
 * 
 * Features:
 * - Current viewport width
 * - Breakpoint detection (mobile, tablet, desktop)
 * - Orientation detection
 * - Debounced resize handling
 * - Custom breakpoint support
 */
export function useResponsive(customBreakpoints = {}) {
  const defaultBreakpoints = {
    mobile: 480,
    tablet: 768,
    desktop: 1024,
    ...customBreakpoints
  };

  const [width, setWidth] = useState(
    typeof window !== 'undefined' ? window.innerWidth : 1200
  );
  
  const [height, setHeight] = useState(
    typeof window !== 'undefined' ? window.innerHeight : 800
  );

  const [orientation, setOrientation] = useState(
    typeof window !== 'undefined' && window.innerHeight > window.innerWidth 
      ? 'landscape' 
      : 'portrait'
  );

  // Debounced resize handler
  const handleResize = useCallback(() => {
    const newWidth = window.innerWidth;
    const newHeight = window.innerHeight;
    const newOrientation = newHeight > newWidth ? 'landscape' : 'portrait';
    
    setWidth(newWidth);
    setHeight(newHeight);
    if (newOrientation !== orientation) {
      setOrientation(newOrientation);
    }
  }, [orientation]);

  useEffect(() => {
    handleResize();
    
    let timeoutId;
    const debouncedResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(handleResize, 150);
    };

    window.addEventListener('resize', debouncedResize);
    window.addEventListener('orientationchange', handleResize);

    return () => {
      clearTimeout(timeoutId);
      window.removeEventListener('resize', debouncedResize);
      window.removeEventListener('orientationchange', handleResize);
    };
  }, [handleResize]);

  return {
    // Dimensions
    width,
    height,
    
    // Breakpoint detection
    isMobile: width < defaultBreakpoints.mobile,
    isTablet: width >= defaultBreakpoints.mobile && width < defaultBreakpoints.tablet,
    isDesktop: width >= defaultBreakpoints.tablet,
    
    // Range detection
    isSmallMobile: width < 380,
    isLargeMobile: width >= 380 && width < defaultBreakpoints.mobile,
    isSmallTablet: width >= defaultBreakpoints.mobile && width < 600,
    isLargeTablet: width >= 600 && width < defaultBreakpoints.tablet,
    isSmallDesktop: width >= defaultBreakpoints.tablet && width < 1200,
    isLargeDesktop: width >= 1200,
    
    // Orientation
    orientation,
    isLandscape: orientation === 'landscape',
    isPortrait: orientation === 'portrait',
    
    // Breakpoint values
    breakpoints: defaultBreakpoints,
    
    // Helpers
    inBreakpoint: (breakpoint) => {
      const bp = defaultBreakpoints[breakpoint];
      return bp ? width >= bp : false;
    },
    
    // Media query generator
    media: {
      mobile: `@media (max-width: ${defaultBreakpoints.mobile - 1}px)`,
      tablet: `@media (min-width: ${defaultBreakpoints.mobile}px) and (max-width: ${defaultBreakpoints.tablet - 1}px)`,
      desktop: `@media (min-width: ${defaultBreakpoints.tablet}px)`,
      smallDesktop: `@media (min-width: ${defaultBreakpoints.tablet}px) and (max-width: 1199px)`,
      largeDesktop: `@media (min-width: 1200px)`,
    }
  };
}
