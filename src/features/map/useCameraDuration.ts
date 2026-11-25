import { usePrefersReducedMotion } from '@/hooks/useMediaQuery';

/** ux-ui 6: camera moves take up to 800 ms, none with reduced motion. */
export function useCameraDuration() {
  return usePrefersReducedMotion() ? 0 : 400;
}
