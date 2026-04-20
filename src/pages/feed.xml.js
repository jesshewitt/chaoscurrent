import { getLinks, sortByAdded } from "@/lib/links.js"
import { TYPE_LABELS } from "@/lib/taxonomy.js"

const SITE = "https://chaoscurrent.org"

function xmlEscape(s) {
    return String(s)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&apos;")
}

function pluralForType(type) {
    const map = {
        essay: "essays",
        book: "books",
        blog: "blogs",
        podcast: "podcasts",
        video: "videos",
        tool: "tools",
        community: "communities",
        archive: "archives",
        adjacent: "adjacent"
    }
    return map[type] ?? type
}

export async function GET() {
    const entries = sortByAdded(await getLinks()).slice(0, 25)
    const items = entries
        .map((e) => {
            const pubDate = new Date(e.added + "T00:00:00Z").toUTCString()
            const link = `${SITE}/${pluralForType(e.type)}/#${e.id}`
            return `
    <item>
        <title>${xmlEscape(e.title)}</title>
        <link>${xmlEscape(link)}</link>
        <guid isPermaLink="false">${xmlEscape(e.id)}</guid>
        <pubDate>${pubDate}</pubDate>
        <category>${xmlEscape(TYPE_LABELS[e.type])}</category>
        <description>${xmlEscape(e.annotation)}</description>
    </item>`
        })
        .join("")

    const body = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Chaos Current</title>
    <link>${SITE}/</link>
    <atom:link href="${SITE}/feed.xml" rel="self" type="application/rss+xml" />
    <description>Recently added entries in the Chaos Current directory.</description>
    <language>en</language>
    ${items}
  </channel>
</rss>`

    return new Response(body, {
        status: 200,
        headers: { "content-type": "application/rss+xml; charset=utf-8" }
    })
}
