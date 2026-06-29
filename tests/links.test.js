import { describe, it, expect } from "vitest"
import { sortByAdded, sortByTitle, countsByType, resolvePeople } from "@/lib/links-core.js"

const sample = [
    {
        id: "a",
        title: "Alpha",
        url: "https://example.com/a",
        type: "essay",
        annotation: "x",
        added: "2026-04-10T00:00:00Z",
        topics: []
    },
    {
        id: "b",
        title: "Beta",
        url: "https://example.com/b",
        type: "essay",
        annotation: "x",
        added: "2026-04-19T00:00:00Z",
        topics: []
    }
]

describe("sortByAdded", () => {
    it("returns entries newest first", () => {
        const out = sortByAdded(sample)
        expect(out.map((e) => e.id)).toEqual(["b", "a"])
    })
})

describe("sortByTitle", () => {
    it("returns entries alphabetically case insensitive", () => {
        const out = sortByTitle([
            { title: "beta" },
            { title: "Alpha" },
            { title: "gamma" }
        ])
        expect(out.map((e) => e.title)).toEqual(["Alpha", "beta", "gamma"])
    })
})

describe("countsByType", () => {
    it("counts each type and returns zero for unseen types", () => {
        const counts = countsByType([
            { type: "essay" },
            { type: "essay" },
            { type: "book" }
        ])
        expect(counts.essay).toBe(2)
        expect(counts.book).toBe(1)
        expect(counts.blog).toBe(0)
    })
})

describe("resolvePeople", () => {
    const peopleMap = new Map([
        ["peter-carroll", { slug: "peter-carroll", name: "Peter J. Carroll" }]
    ])

    it("attaches peopleResolved with resolved names", () => {
        const out = resolvePeople(
            [{ id: "x", people: ["peter-carroll"] }],
            peopleMap
        )
        expect(out[0].peopleResolved).toEqual([
            { slug: "peter-carroll", name: "Peter J. Carroll" }
        ])
    })

    it("falls back to slug as name when slug is not in map", () => {
        const out = resolvePeople(
            [{ id: "x", people: ["unknown-person"] }],
            peopleMap
        )
        expect(out[0].peopleResolved).toEqual([
            { slug: "unknown-person", name: "unknown-person" }
        ])
    })

    it("handles entries with no people field", () => {
        const out = resolvePeople([{ id: "x" }], peopleMap)
        expect(out[0].peopleResolved).toEqual([])
    })
})
