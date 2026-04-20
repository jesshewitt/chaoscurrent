export function buildSearchDocuments(entries) {
    return entries.map((e) => {
        const doc = {
            id: e.id,
            title: e.title,
            type: e.type,
            topics: e.topics ?? [],
            annotation: e.annotation
        }
        if (e.author !== undefined) doc.author = e.author
        if (e.year !== undefined) doc.year = e.year
        return doc
    })
}

export const FUSE_OPTIONS = {
    includeScore: false,
    threshold: 0.35,
    ignoreLocation: true,
    keys: [
        { name: "title", weight: 0.5 },
        { name: "author", weight: 0.2 },
        { name: "topics", weight: 0.15 },
        { name: "annotation", weight: 0.15 }
    ]
}
