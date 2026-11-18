import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import prettier from "eslint-config-prettier/flat";

// Next.js 16 hat "next lint" entfernt. ESLint läuft jetzt direkt mit "npm run lint"
// und nutzt das neue Flat-Config-Format statt .eslintrc.json.
export default defineConfig([
  ...nextVitals,
  prettier,
  globalIgnores([".next/**", "node_modules/**", "public/tinymce/**", "next-env.d.ts"]),
]);
