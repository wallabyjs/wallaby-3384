import { defineConfig, loadEnv } from "vite";
import solid from "vite-plugin-solid";
import tsconfigPaths from "vite-tsconfig-paths";
import { sentryVitePlugin } from "@sentry/vite-plugin";
import { dirname, resolve } from "path";
const dir = dirname(new URL(import.meta.url).pathname);
export default defineConfig(({ mode }) => {
  process.env = { ...process.env, ...loadEnv(mode, process.cwd()) };
  return {
    server: { port: +(process.env.VITE_PORT ?? 3000) },
    plugins: [
      // nodePolyfills(),
      tsconfigPaths({ loose: true }),
      solid(),
      sentryVitePlugin({
        authToken: process.env.SENTRY_AUTH_TOKEN,
        org: "inio",
        project: "inio-front-end",
        telemetry: false,
      }),
    ],
    define: { "process.env.BABEL_TYPES_8_BREAKING": "true" },
    build: {
      target: "esnext",
      polyfillDynamicImport: false,
      minify: false,
      chunkSizeWarningLimit: 600,
      sourcemap: true,
      rollupOptions: {
        input: "./src/main.tsx",
        output: {
          assetFileNames: "[name][extname]",
          chunkFileNames: "[name].js",
          entryFileNames: "[name].js",
          manualChunks: () => "main.js",
        },
      },
    },
    optimizeDeps: { esbuildOptions: { target: "esnext" } },
    test: {
      environment: "jsdom",
      transformMode: { web: [/\\.[jt]sx?$/] },
      threads: true,
      isolate: true,
      globals: true,
    },
    resolve: {
      conditions: ["development", "browser"],
      alias: [
        { find: "fs", replacement: resolve(dir, "src/fake-modules.ts") },
        { find: "path", replacement: resolve(dir, "src/fake-modules.ts") },
        {
          find: "source-map-js",
          replacement: resolve(dir, "src/fake-modules.ts"),
        },
        { find: "url", replacement: resolve(dir, "src/fake-modules.ts") },
      ],
    },
  };
});
