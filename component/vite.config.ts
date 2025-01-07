import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";
import dts from "vite-plugin-dts";



// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    react(),
    dts({ tsconfigPath: "./tsconfig.app.json", include: "lib" }),
  ],
  build: {
    lib: {
      entry: resolve(__dirname, "lib/main.tsx"),
      name: "animate-viewport",
      fileName: "animate-viewport",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
      output: {
        globals: {
          react: "React",
          "react-dom": "react-dom",
        },
      },
    },
  },
});
