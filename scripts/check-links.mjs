#!/usr/bin/env node
// Report-only link checker. Reads links.yaml, checks each URL, and prints a
// human-readable report. It deliberately writes nothing and changes no entries:
// a human decides what to remove or update based on the report.
import { readFile } from "node:fs/promises"
import { load as yamlLoad } from "js-yaml"
import path from "node:path"

const LINKS_FILE = "src/data/links.yaml"
const WAYBACK_AVAILABLE = "https://archive.org/wayback/available"
// A browser-like UA: site-builder hosts and WAFs often serve 404/403 to
// unknown bots, which previously produced false positives.
const USER_AGENT =
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 " +
    "(KHTML, like Gecko) Chrome/124.0 Safari/537.36"
const TIMEOUT_MS = 15_000
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
    // 401/403 mean access-denied, not gone — usually a bot/WAF block on a live
    // page. Surface as "blocked" so a human verifies rather than treating as dead.
    if (status === 401 || status === 403) return { status: "blocked", finalUrl: null }
    return { status: "dead", finalUrl: null }
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

const REQUEST_HEADERS = {
    "user-agent": USER_AGENT,
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
    "accept-language": "en-US,en;q=0.9"
}

async function checkOne(url) {
    const originalHost = new URL(url).host
    try {
        let res = await fetchWithTimeout(url, {
            method: "HEAD",
            headers: REQUEST_HEADERS,
            redirect: "follow"
        })
        // Many servers implement HEAD poorly and return 404/403/405/501 for a
        // page that GET serves fine. Fall back to GET on any non-OK HEAD.
        if (!res.ok) {
            res = await fetchWithTimeout(url, {
                method: "GET",
                headers: REQUEST_HEADERS,
                redirect: "follow"
            })
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

function printSection(title, rows, format) {
    if (rows.length === 0) return
    console.log(`\n${title} (${rows.length}):`)
    for (const r of rows) console.log(`  - ${format(r)}`)
}

async function main() {
    const entries = await loadLinks()
    console.log(
        `Checking ${entries.length} links (report-only — nothing will be modified).`
    )

    const results = await pool(entries, CONCURRENCY, async (e) => {
        const obs = await checkOne(e.url)
        if (obs.status === "dead") {
            obs.archived = await waybackHasSnapshot(e.url)
        }
        return { id: e.id, title: e.title, url: e.url, ...obs }
    })

    const dead = results.filter((r) => r.status === "dead")
    const blocked = results.filter((r) => r.status === "blocked")
    const redirects = results.filter((r) => r.status === "redirect")
    const slow = results.filter((r) => r.status === "slow")
    const ok = results.length - dead.length - blocked.length - redirects.length - slow.length

    console.log(
        `\nSummary: ${ok} ok, ${dead.length} dead, ${blocked.length} blocked, ` +
            `${redirects.length} redirected, ${slow.length} slow.`
    )

    printSection(
        "DEAD — verify in a browser, then remove the entry if truly gone",
        dead,
        (r) => `${r.id} — ${r.url}  [wayback snapshot: ${r.archived ? "yes" : "no"}]`
    )
    printSection(
        "BLOCKED — 401/403, likely a live page behind a bot/WAF block; verify manually",
        blocked,
        (r) => `${r.id} — ${r.url}`
    )
    printSection(
        "REDIRECTED — moved to another host; consider updating the URL",
        redirects,
        (r) => `${r.id} — ${r.url} -> ${r.finalUrl}`
    )
    printSection(
        "SLOW — timed out; usually transient, re-check before acting",
        slow,
        (r) => `${r.id} — ${r.url}`
    )

    if (dead.length === 0) {
        console.log("\nNo dead links. No action needed.")
    } else {
        console.log(
            "\nNothing was changed. Review the DEAD list above and remove confirmed entries by hand."
        )
    }

    // Non-zero exit if dead links were found, so CI can flag a run for review —
    // but the script still modifies nothing.
    process.exitCode = dead.length > 0 ? 1 : 0
}

if (import.meta.url === `file://${process.argv[1]}`) main()
