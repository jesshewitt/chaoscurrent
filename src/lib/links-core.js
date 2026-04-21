import { TYPES } from "./taxonomy.js"

const WAYBACK_PREFIX = "https://web.archive.org/web/*/"

export function joinHealth(entries, health) {
    const table = health?.entries ?? {}
    return entries.map((e) => {
        const rec = table[e.id] ?? { status: "unchecked", lastChecked: null, finalUrl: null }
        const isDead = rec.status === "dead" || rec.status === "dead-no-archive"
        const href = rec.status === "dead" ? WAYBACK_PREFIX + e.url : e.url
        return {
            ...e,
            health: rec,
            href,
            isDead,
            isPreserved: rec.status === "dead",
            isGone: rec.status === "dead-no-archive",
            isRedirect: rec.status === "redirect"
        }
    })
}

export function sortByAdded(entries) {
    return [...entries].sort((a, b) => (a.added < b.added ? 1 : a.added > b.added ? -1 : 0))
}

export function sortByTitle(entries) {
    return [...entries].sort((a, b) =>
        a.title.toLowerCase().localeCompare(b.title.toLowerCase())
    )
}

export function countsByType(entries) {
    const counts = Object.fromEntries(TYPES.map((t) => [t, 0]))
    for (const e of entries) counts[e.type] = (counts[e.type] ?? 0) + 1
    return counts
}

export function resolvePeople(entries, peopleMap) {
    return entries.map((e) => ({
        ...e,
        peopleResolved: (e.people ?? []).map((slug) => ({
            slug,
            name: peopleMap.get(slug)?.name ?? slug
        }))
    }))
}
