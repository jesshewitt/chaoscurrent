import { describe, it, expect } from "vitest"
import { TYPES, TYPE_LABELS, isType, typeFor, FEATURED_TOPICS } from "@/lib/taxonomy.js"

describe("taxonomy TYPES", () => {
    it("contains the nine canonical types in order", () => {
        expect(TYPES).toEqual([
            "essay",
            "book",
            "blog",
            "podcast",
            "video",
            "tool",
            "community",
            "archive",
            "adjacent"
        ])
    })

    it("maps every type to a display label", () => {
        for (const t of TYPES) {
            expect(TYPE_LABELS[t]).toBeTypeOf("string")
            expect(TYPE_LABELS[t].length).toBeGreaterThan(0)
        }
    })

    it("isType validates known and rejects unknown", () => {
        expect(isType("essay")).toBe(true)
        expect(isType("nonsense")).toBe(false)
    })

    it("typeFor singular and plural forms both resolve", () => {
        expect(typeFor("essay")).toBe("essay")
        expect(typeFor("essays")).toBe("essay")
        expect(typeFor("book")).toBe("book")
        expect(typeFor("books")).toBe("book")
        expect(typeFor("nonsense")).toBe(null)
    })
})

describe("FEATURED_TOPICS", () => {
    it("contains exactly six slugs", () => {
        expect(FEATURED_TOPICS).toHaveLength(6)
    })

    it("lists the agreed featured slugs in order", () => {
        expect(FEATURED_TOPICS).toEqual([
            "theory",
            "history",
            "sigils",
            "gnosis",
            "ritual",
            "paradigms"
        ])
    })
})
