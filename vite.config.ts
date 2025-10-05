import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  server: {
    host: "::",
    port: 8080,
  },
  publicDir: "public",
  build: {
    outDir: "dist",
    copyPublicDir: true,
    chunkSizeWarningLimit: 1000, // suppress warning
  },
  plugins: [
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
