import { describe, it, expect } from "vitest"
import { joinHealth, sortByAdded, sortByTitle, countsByType, resolvePeople } from "@/lib/links-core.js"

const sample = [
    {
        id: "a",
        title: "Alpha",
        url: "https://example.com/a",
        type: "essay",
        annotation: "x",
        added: "2026-04-10",
        topics: []
    },
    {
        id: "b",
        title: "Beta",
        url: "https://example.com/b",
        type: "essay",
        annotation: "x",
        added: "2026-04-19",
        topics: []
    }
]

const health = {
    lastRun: "2026-04-18T00:00:00Z",
    entries: {
        a: { status: "dead", lastChecked: "2026-04-18T00:00:00Z", finalUrl: null },
        b: { status: "ok", lastChecked: "2026-04-18T00:00:00Z", finalUrl: null }
    }
}

describe("joinHealth", () => {
    it("merges health status onto each entry", () => {
        const out = joinHealth(sample, health)
        expect(out[0].health.status).toBe("dead")
        expect(out[1].health.status).toBe("ok")
    })

    it("defaults to unchecked when no health record exists", () => {
        const out = joinHealth(sample, { lastRun: null, entries: {} })
        expect(out[0].health.status).toBe("unchecked")
    })

    it("for dead entries, rewrites href to wayback and keeps original url", () => {
        const out = joinHealth(sample, health)
        expect(out[0].href).toBe("https://web.archive.org/web/*/https://example.com/a")
        expect(out[0].url).toBe("https://example.com/a")
    })

    it("for ok entries, href equals url", () => {
        const out = joinHealth(sample, health)
        expect(out[1].href).toBe("https://example.com/b")
    })
})

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
