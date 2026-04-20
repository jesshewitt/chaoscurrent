import { getCollection } from "astro:content"
import healthJson from "../data/link-health.json" with { type: "json" }
import { joinHealth, sortByAdded } from "./links-core.js"

export { joinHealth, sortByAdded, sortByTitle, countsByType } from "./links-core.js"

async function loadRawLinks() {
    const collection = await getCollection("links")
    return collection.map((item) => item.data)
}

export async function getLinks() {
    const raw = await loadRawLinks()
    return joinHealth(raw, healthJson)
}

export async function getByType(type) {
    const all = await getLinks()
    return all.filter((e) => e.type === type)
}

export async function getByTopic(slug) {
    const all = await getLinks()
    return all.filter((e) => (e.topics ?? []).includes(slug))
}

export async function getRecent(limit = 6) {
    const all = await getLinks()
    return sortByAdded(all).slice(0, limit)
}
