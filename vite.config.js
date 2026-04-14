import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Avoid two copies of Firebase in dev (can break Firestore watch internals).
    dedupe: ["firebase"],
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("firebase")) return "vendor-firebase";
          if (id.includes("recharts")) return "vendor-recharts";
          if (id.includes("lucide-react")) return "vendor-icons";
          if (id.includes("react-dom") || id.includes("react-router") || id.includes("/react/")) {
            return "vendor-react";
          }
        },
      },
    },
    chunkSizeWarningLimit: 700,
  },
});
