#!/usr/bin/env node
import { readFile, writeFile } from "node:fs/promises"
import { load as yamlLoad } from "js-yaml"
import path from "node:path"

const LINKS_FILE = "src/data/links.yaml"
const HEALTH_FILE = "src/data/link-health.json"
const WAYBACK_AVAILABLE = "https://archive.org/wayback/available"
const USER_AGENT =
    "ChaosCurrentHealthCheck/0.1 (+https://chaoscurrent.org; contact: curator@chaoscurrent.org)"
const TIMEOUT_MS = 10_000
const CONCURRENCY = 8
const JITTER_MS = 250

export function classify({ ok, status, redirectedTo, originalHost, timedOut }) {
    if (timedOut) return { status: "slow", finalUrl: null }
    if (ok === true) {
        if (redirectedTo && originalHost) {
            const host = new URL(redirectedTo).host
            if (host !== originalHost) {
                return { status: "redirect", finalUrl: redirectedTo }
            }
        }
        return { status: "ok", finalUrl: null }
    }
    return { status: "dead", finalUrl: null }
}

export function mergeStatus(prior, observation, timestamp) {
    const priorStreak = prior?.deadStreak ?? 0
    if (observation.status === "dead") {
        const streak = priorStreak + 1
        const status = streak >= 2 ? "dead" : prior?.status ?? "ok"
        return {
            status,
            lastChecked: timestamp,
            finalUrl: observation.finalUrl ?? null,
            deadStreak: streak
        }
    }
    return {
        status: observation.status,
        lastChecked: timestamp,
        finalUrl: observation.finalUrl ?? null,
        deadStreak: 0
    }
}

async function sleep(ms) {
    return new Promise((r) => setTimeout(r, ms))
}

async function fetchWithTimeout(url, opts) {
    const ac = new AbortController()
    const t = setTimeout(() => ac.abort(), TIMEOUT_MS)
    try {
        const res = await fetch(url, { ...opts, signal: ac.signal })
        return res
    } finally {
        clearTimeout(t)
    }
}

async function checkOne(url) {
    const originalHost = new URL(url).host
    const headers = { "user-agent": USER_AGENT }
    try {
        let res = await fetchWithTimeout(url, { method: "HEAD", headers, redirect: "follow" })
        if (res.status === 405 || res.status === 403) {
            res = await fetchWithTimeout(url, { method: "GET", headers, redirect: "follow" })
        }
        const redirectedTo = res.redirected ? res.url : null
        return classify({
            ok: res.ok,
            status: res.status,
            redirectedTo,
            originalHost
        })
    } catch (e) {
        if (e?.name === "AbortError") return classify({ timedOut: true })
        return classify({ ok: false, status: 0 })
    }
}

async function waybackHasSnapshot(url) {
    try {
        const res = await fetchWithTimeout(`${WAYBACK_AVAILABLE}?url=${encodeURIComponent(url)}`, {
            method: "GET",
            headers: { "user-agent": USER_AGENT }
        })
        const body = await res.json()
        return Boolean(body?.archived_snapshots?.closest?.available)
    } catch {
        return false
    }
}

async function pool(items, size, worker) {
    const results = []
    let i = 0
    const workers = Array.from({ length: size }, async () => {
        while (i < items.length) {
            const idx = i++
            await sleep(JITTER_MS)
            results[idx] = await worker(items[idx])
        }
    })
    await Promise.all(workers)
    return results
}

async function loadLinks() {
    const body = await readFile(path.resolve(process.cwd(), LINKS_FILE), "utf8")
    return yamlLoad(body)
}

async function loadHealth() {
    try {
        const body = await readFile(path.resolve(process.cwd(), HEALTH_FILE), "utf8")
        return JSON.parse(body)
    } catch {
        return { lastRun: null, entries: {} }
    }
}

async function main() {
    const entries = await loadLinks()
    const prior = await loadHealth()
    const timestamp = new Date().toISOString()

    console.log(`Checking ${entries.length} links with concurrency ${CONCURRENCY}.`)
    const observations = await pool(entries, CONCURRENCY, async (e) => {
        const obs = await checkOne(e.url)
        if (obs.status === "dead") {
            const hasSnap = await waybackHasSnapshot(e.url)
            if (!hasSnap) obs.status = "dead-no-archive"
        }
        return { id: e.id, url: e.url, obs }
    })

    const next = { lastRun: timestamp, entries: { ...(prior.entries ?? {}) } }
    let changed = false
    for (const { id, obs } of observations) {
        const priorRec = prior.entries?.[id]
        const merged = mergeStatus(priorRec, obs, timestamp)
        if (!priorRec || priorRec.status !== merged.status) changed = true
        next.entries[id] = merged
    }

    await writeFile(
        path.resolve(process.cwd(), HEALTH_FILE),
        JSON.stringify(next, null, 2) + "\n",
        "utf8"
    )
    console.log(
        changed
            ? "Health file updated; at least one status changed."
            : "Health file updated; no status changes."
    )
}

if (import.meta.url === `file://${process.argv[1]}`) main()
