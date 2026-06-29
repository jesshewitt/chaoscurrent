import { getCollection } from "astro:content"
import { sortByAdded, resolvePeople } from "./links-core.js"

export { sortByAdded, sortByTitle, countsByType, resolvePeople } from "./links-core.js"

async function loadRawLinks() {
    const collection = await getCollection("links")
    return collection.map((item) => item.data)
}

async function loadPeopleMap() {
    const collection = await getCollection("people")
    return new Map(collection.map((p) => [p.data.slug, p.data]))
}

export async function getLinks() {
    const raw = await loadRawLinks()
    const peopleMap = await loadPeopleMap()
    return resolvePeople(raw, peopleMap)
}

export async function getByType(type) {
    const all = await getLinks()
    return all.filter((e) => e.type === type)
}

export async function getByTopic(slug) {
    const all = await getLinks()
    return all.filter((e) => (e.topics ?? []).includes(slug))
}

export async function getByPerson(slug) {
    const all = await getLinks()
    return all.filter((e) => (e.people ?? []).includes(slug))
}

export async function getRecent(limit = 6) {
    const all = await getLinks()
    return sortByAdded(all).slice(0, limit)
}
