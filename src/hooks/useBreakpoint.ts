import { useMediaQuery } from './useMediaQuery';

/** ux-ui 12: phone up to 759 px, tablet 760–1023 px, desktop from 1024 px. */
export function useBreakpoint(): 'phone' | 'tablet' | 'desktop' {
  const phone = useMediaQuery('(max-width: 759px)');
  const tablet = useMediaQuery('(min-width: 760px) and (max-width: 1023px)');
  return phone ? 'phone' : tablet ? 'tablet' : 'desktop';
}
