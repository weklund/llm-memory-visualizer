import path from "node:path";
import mdx from "@mdx-js/rollup";
import react from "@vitejs/plugin-react";
import remarkGfm from "remark-gfm";
import { defineConfig } from "vite";

/**
 * BASE_PATH for GitHub Pages project sites, e.g. `/llm-memory-visualizer/`.
 * Local dev and generic hosts use `/`.
 */
const base = process.env.BASE_PATH ?? "/";

export default defineConfig({
  base,
  plugins: [
    {
      enforce: "pre",
      ...mdx({
        providerImportSource: "@mdx-js/react",
        // GFM tables/strikethrough/etc. (pipe tables in lessons)
        remarkPlugins: [remarkGfm],
      }),
    },
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  server: {
    port: 5173,
  },
  build: {
    target: "es2022",
    chunkSizeWarningLimit: 1400,
  },
});
