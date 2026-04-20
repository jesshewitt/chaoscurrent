import { load as yamlLoad } from "js-yaml"
import { z } from "zod"

const entriesSection = z.object({
    heading: z.string().min(1),
    kind: z.literal("entries"),
    entries: z.array(z.object({
        ref: z.string().min(1),
        note: z.string().min(1)
    })).min(1)
})

const topicsSection = z.object({
    heading: z.string().min(1),
    kind: z.literal("topics"),
    topics: z.array(z.string().min(1)).min(1)
})

const section = z.discriminatedUnion("kind", [entriesSection, topicsSection])

const introSchema = z.object({
    sections: z.array(section).min(1)
})

export function parseIntroData(yamlText) {
    const raw = yamlLoad(yamlText)
    return introSchema.parse(raw)
}

export function resolveIntroSections(sections, links) {
    const byId = new Map(links.map((l) => [l.id, l]))
    return sections.map((s) => {
        if (s.kind !== "entries") return s
        const resolvedEntries = s.entries.map((e) => {
            const link = byId.get(e.ref)
            if (!link) throw new Error(`intro.yaml: unknown ref "${e.ref}"`)
            return { link, note: e.note }
        })
        return { ...s, entries: resolvedEntries }
    })
}
