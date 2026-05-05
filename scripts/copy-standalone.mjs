import { cpSync, mkdirSync, existsSync } from "fs"
import { join } from "path"

const standaloneDir = ".next/standalone"
const staticDir = ".next/static"
const publicDir = "public"

if (!existsSync(standaloneDir)) {
  console.error("Standalone directory not found. Run `next build` first.")
  process.exit(1)
}

// Copy .next/static → .next/standalone/.next/static
const staticDest = join(standaloneDir, ".next", "static")
mkdirSync(staticDest, { recursive: true })
cpSync(staticDir, staticDest, { recursive: true })
console.log("✓ Copied .next/static to .next/standalone/.next/")

// Copy public → .next/standalone/public
const publicDest = join(standaloneDir, "public")
mkdirSync(publicDest, { recursive: true })
cpSync(publicDir, publicDest, { recursive: true })
console.log("✓ Copied public to .next/standalone/")
