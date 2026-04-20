#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises"
import sharp from "sharp"
import path from "node:path"

const SRC = "public/og-source.svg"
const OUT = "public/og-image.png"

async function main() {
    const svg = await readFile(path.resolve(process.cwd(), SRC))
    const png = await sharp(svg).resize(1200, 630).png().toBuffer()
    await writeFile(path.resolve(process.cwd(), OUT), png)
    console.log(`wrote ${OUT}`)
}

main()
