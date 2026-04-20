import { defineConfig } from "astro/config"
import { fileURLToPath } from "node:url"

export default defineConfig({
    site: "https://chaoscurrent.org",
    output: "static",
    trailingSlash: "always",
    build: {
        format: "directory",
        assets: "assets"
    },
    compressHTML: true,
    prefetch: {
        defaultStrategy: "viewport"
    },
    vite: {
        resolve: {
            alias: {
                "@": fileURLToPath(new URL("./src", import.meta.url))
            }
        }
    }
})
