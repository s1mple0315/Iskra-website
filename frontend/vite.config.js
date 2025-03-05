import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:8001",
        changeOrigin: true,
        secure: false,
      },

      "/static": {
        target: "http://localhost:8002",
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
