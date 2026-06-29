import { TYPES } from "./taxonomy.js"

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
