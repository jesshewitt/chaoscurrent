import { describe, it, expect } from "vitest"
import { relativeLuminance, contrastRatio, passesAA } from "../scripts/contrast-check.mjs"

describe("relativeLuminance", () => {
    it("returns 1 for white and 0 for black", () => {
        expect(relativeLuminance("#ffffff")).toBeCloseTo(1, 3)
        expect(relativeLuminance("#000000")).toBeCloseTo(0, 3)
    })
})

describe("contrastRatio", () => {
    it("returns 21 for black on white", () => {
        expect(contrastRatio("#000000", "#ffffff")).toBeCloseTo(21, 1)
    })

    it("is symmetric", () => {
        const a = contrastRatio("#c88a8a", "#0a0a0c")
        const b = contrastRatio("#0a0a0c", "#c88a8a")
        expect(a).toBeCloseTo(b, 5)
    })
})

describe("passesAA", () => {
    it("requires 4.5:1 for body text by default", () => {
        expect(passesAA("#ffffff", "#000000")).toBe(true)
        expect(passesAA("#777777", "#ffffff")).toBe(false)
    })

    it("accepts 3:1 when large text is requested", () => {
        expect(passesAA("#767676", "#ffffff", { large: true })).toBe(true)
    })
})
