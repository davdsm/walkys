import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  plugins: [tailwindcss(), reactRouter(), tsconfigPaths()],
  envPrefix: ["VITE_", "API_"],
  resolve: {
    // Ensure /app/routes/* resolves to app/app/routes/* for virtual:react-router/server-build
    alias: {
      "/app": path.resolve(__dirname, "app"),
    },
  },
  optimizeDeps: {
    include: ["@mladenilic/threesixty.js"],
  },
});
