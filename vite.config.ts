import { defineConfig } from "vite";
import pkg from "./package.json" with { type: "json" };

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name: pkg.name,
    },
    rollupOptions: {
      external: ["@linkurious/ogma", "vis-timeline", "vis-data"],
      output: {
        name: "OgmaTimelinePlugin",
        globals: {
          "@linkurious/ogma": "Ogma",
          "vis-timeline": "vis",
          "vis-data": "vis",
        },
      },
    },
    emptyOutDir: false,
  },
  test: {
    testTimeout: 60_000,
    hookTimeout: 60_000,
  },
});
