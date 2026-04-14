import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  resolve: {
    // Avoid two copies of Firebase in dev (can break Firestore watch internals).
    dedupe: ["firebase"],
  },
});
