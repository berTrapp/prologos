import { defineConfig, mergeConfig } from 'vitest/config';
import viteConfig from './vite.config.ts';

export default mergeConfig(
  viteConfig,
  defineConfig({
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      include: ['src/**/*.test.{ts,tsx}'],
      coverage: {
        provider: 'v8',
        // Business rules are pure functions and must stay fully tested (CLAUDE.md, phase 2).
        include: ['src/domain/**/*.ts'],
        exclude: ['src/domain/**/*.test.ts', 'src/domain/fixtures.ts'],
        thresholds: { statements: 95, branches: 95, functions: 95, lines: 95 },
      },
    },
  }),
);
