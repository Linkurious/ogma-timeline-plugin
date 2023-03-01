import { name } from "./package.json";
import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/index.ts",
      name,
    },
    rollupOptions: {
      external: ["@linkurious/ogma"],
    },
    emptyOutDir: false,
  },
});
