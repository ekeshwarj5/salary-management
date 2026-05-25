import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['**/test/**/*.test.ts', '**/src/**/*.test.ts'],
    exclude: ['**/node_modules/**', '**/dist/**'],
    coverage: {
      reporter: ['text', 'html'],
      include: ['**/src/**/*.ts'],
      exclude: ['**/src/**/*.test.ts', '**/src/**/index.ts'],
    },
  },
});
