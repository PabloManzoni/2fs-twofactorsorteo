import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Served on GitHub Pages under /2fs-twofactorsorteo/. Override with `npm run
// build -- --base=/` or the BASE_PATH env var if deploying elsewhere.
export default defineConfig({
  plugins: [react()],
  base: process.env.BASE_PATH ?? "/2fs-twofactorsorteo/",
});
