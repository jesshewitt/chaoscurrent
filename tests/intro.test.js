import { describe, it, expect } from "vitest"
import { parseIntroData, resolveIntroSections } from "@/lib/intro.js"

const sampleYaml = `
intro: "Hello"
sections:
  - heading: "Foundations"
    kind: entries
    entries:
      - ref: some-id
        note: "Start here."
  - heading: "Ideas"
    kind: topics
    topics:
      - theory
      - sigils
`

describe("parseIntroData", () => {
    it("returns intro text and sections", () => {
        const parsed = parseIntroData(sampleYaml)
        expect(parsed.intro).toBe("Hello")
        expect(parsed.sections).toHaveLength(2)
        expect(parsed.sections[0].heading).toBe("Foundations")
        expect(parsed.sections[0].kind).toBe("entries")
        expect(parsed.sections[1].kind).toBe("topics")
    })

    it("throws on unknown section kind", () => {
        const bad = `
intro: "x"
sections:
  - heading: "Bad"
    kind: chaos
`
        expect(() => parseIntroData(bad)).toThrow()
    })
})

describe("resolveIntroSections", () => {
    const links = [
        { id: "some-id", title: "Some Title", url: "https://example.com" }
    ]

    it("resolves entry refs to link records with notes", () => {
        const sections = [
            {
                heading: "Foundations",
                kind: "entries",
                entries: [{ ref: "some-id", note: "n" }]
            }
        ]
        const resolved = resolveIntroSections(sections, links)
        expect(resolved[0].entries[0].link.id).toBe("some-id")
        expect(resolved[0].entries[0].note).toBe("n")
    })

    it("throws when a ref does not match any link id", () => {
        const sections = [
            {
                heading: "Foundations",
                kind: "entries",
                entries: [{ ref: "missing-id", note: "n" }]
            }
        ]
        expect(() => resolveIntroSections(sections, links)).toThrow(/missing-id/)
    })

    it("passes topic sections through untouched", () => {
        const sections = [
            { heading: "Ideas", kind: "topics", topics: ["theory"] }
        ]
        const resolved = resolveIntroSections(sections, links)
        expect(resolved[0]).toEqual(sections[0])
    })
})
