import { name } from "./package.json";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name,
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
