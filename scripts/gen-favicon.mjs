#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises"
import sharp from "sharp"
import path from "node:path"

const SRC = "public/favicon.svg"
const OUT_180 = "public/apple-touch-icon.png"
const OUT_32 = "public/favicon-32.png"

async function main() {
    const svg = await readFile(path.resolve(process.cwd(), SRC))
    const darkSvg = svg.toString().replace("color: #2a241c", "color: #e8e2d6")

    const png180 = await sharp(Buffer.from(darkSvg)).resize(180, 180).png().toBuffer()
    await writeFile(path.resolve(process.cwd(), OUT_180), png180)

    const png32 = await sharp(Buffer.from(darkSvg)).resize(32, 32).png().toBuffer()
    await writeFile(path.resolve(process.cwd(), OUT_32), png32)

    console.log(`wrote ${OUT_180} and ${OUT_32}`)
}

main()
