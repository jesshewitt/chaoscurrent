export const TYPES = [
    "essay",
    "book",
    "blog",
    "podcast",
    "video",
    "tool",
    "community",
    "archive",
    "adjacent"
]

export const TYPE_LABELS = {
    essay: "Essays",
    book: "Books",
    blog: "Blogs",
    podcast: "Podcasts",
    video: "Videos",
    tool: "Tools",
    community: "Communities",
    archive: "Archives",
    adjacent: "Adjacent"
}

export const TYPE_BLURBS = {
    essay: "Foundational and useful writings on chaos magic.",
    book: "In print and out of print volumes, the canonical reading list.",
    blog: "Living practitioner and group blogs worth returning to.",
    podcast: "Audio conversations on theory and practice.",
    video: "Recorded lectures and video essays.",
    tool: "Sigil generators, oracles, and practical utilities.",
    community: "Forums, subreddits, and moderated discussion spaces.",
    archive: "Historical and archival material preserved online.",
    adjacent: "Currents and movements adjacent to chaos magic."
}

const PLURAL_TO_SINGULAR = {
    essays: "essay",
    books: "book",
    blogs: "blog",
    podcasts: "podcast",
    videos: "video",
    tools: "tool",
    communities: "community",
    archives: "archive",
    adjacent: "adjacent"
}

export function isType(value) {
    return TYPES.includes(value)
}

export function typeFor(slugOrType) {
    if (isType(slugOrType)) return slugOrType
    return PLURAL_TO_SINGULAR[slugOrType] ?? null
}

export function pluralOf(type) {
    if (!isType(type)) return null
    for (const [plural, singular] of Object.entries(PLURAL_TO_SINGULAR)) {
        if (singular === type) return plural
    }
    return type
}
