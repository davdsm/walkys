import { reactRouter } from "@react-router/dev/vite";
import tailwindcss from "@tailwindcss/vite";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { defineConfig, loadEnv } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig(({ mode }) => {
  // Load every .env value (no prefix filter) into process.env so server-side
  // loaders/actions running under `react-router dev` can access SMTP_*,
  // ADMIN_EMAIL, ANTI_BOT_SECRET, etc. Vite normally only exposes prefixed
  // vars to client code, leaving process.env unchanged.
  const env = loadEnv(mode, __dirname, "");
  for (const [key, value] of Object.entries(env)) {
    if (process.env[key] === undefined) {
      process.env[key] = value;
    }
  }

  return {
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
  };
});
