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
    essay: "Writings on chaos magic worth reading.",
    book: "Books. In print, out of print, classics, and newer arrivals.",
    blog: "Blogs that are still being written on.",
    podcast: "Conversations about magic, in your ears.",
    video: "Lectures and video essays.",
    tool: "Sigil generators, oracles, and other practical bits.",
    community: "Places to talk about magic with other magicians.",
    archive: "Older and archival material still findable online.",
    adjacent: "Currents next door: Discordianism, postmodern occultism, cousins."
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
