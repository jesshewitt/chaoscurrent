import { describe, it, expect } from "vitest"
import { buildSearchDocuments } from "@/lib/search-index.js"

const sample = [
    {
        id: "carroll-liber-null",
        title: "Liber Null",
        url: "https://example.com/liber-null",
        type: "book",
        author: "Peter Carroll",
        year: 1987,
        topics: ["theory", "sigils"],
        annotation: "A foundational primer."
    }
]

describe("buildSearchDocuments", () => {
    it("flattens each entry into a search document with stable keys", () => {
        const docs = buildSearchDocuments(sample)
        expect(docs).toHaveLength(1)
        expect(docs[0]).toEqual({
            id: "carroll-liber-null",
            title: "Liber Null",
            author: "Peter Carroll",
            year: 1987,
            type: "book",
            topics: ["theory", "sigils"],
            annotation: "A foundational primer."
        })
    })

    it("omits missing optional fields without crashing", () => {
        const docs = buildSearchDocuments([
            { id: "x", title: "X", url: "https://e.com", type: "blog", annotation: "y", topics: [] }
        ])
        expect(docs[0].author).toBeUndefined()
        expect(docs[0].year).toBeUndefined()
    })
})
