/// <reference types="vitest/config" />
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react()],
    server: { port: 5173, host: true }, // host: true also serves on the local network, so a phone on the same Wi-Fi can open it
    preview: { port: 4173, host: true },
    build: { target: 'es2022', chunkSizeWarningLimit: 1200 },
    test: {
      environment: 'jsdom',
      globals: true,
      setupFiles: ['./src/test/setup.ts'],
      css: false,
      include: ['src/**/*.test.{ts,tsx}'],
    },
  };
});
