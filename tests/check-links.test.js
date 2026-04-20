import { describe, it, expect } from "vitest"
import {
    classify,
    mergeStatus
} from "../scripts/check-links.mjs"

describe("classify", () => {
    it("returns ok for 2xx", () => {
        expect(classify({ ok: true, status: 200, redirectedTo: null })).toEqual({
            status: "ok",
            finalUrl: null
        })
    })

    it("returns redirect when the destination domain differs", () => {
        expect(
            classify({
                ok: true,
                status: 200,
                redirectedTo: "https://new.example.com/",
                originalHost: "old.example.com"
            })
        ).toEqual({
            status: "redirect",
            finalUrl: "https://new.example.com/"
        })
    })

    it("returns ok when redirect stays on the same host", () => {
        expect(
            classify({
                ok: true,
                status: 200,
                redirectedTo: "https://same.example.com/new-path",
                originalHost: "same.example.com"
            })
        ).toEqual({
            status: "ok",
            finalUrl: null
        })
    })

    it("returns dead for 4xx or 5xx", () => {
        expect(classify({ ok: false, status: 404 }).status).toBe("dead")
        expect(classify({ ok: false, status: 503 }).status).toBe("dead")
    })

    it("returns slow on timeout after retry", () => {
        expect(classify({ timedOut: true }).status).toBe("slow")
    })
})

describe("mergeStatus", () => {
    it("flips to dead only after two consecutive dead observations", () => {
        const prior = { status: "ok", deadStreak: 0, lastChecked: "2026-04-01T00:00:00Z", finalUrl: null }
        const first = mergeStatus(prior, { status: "dead", finalUrl: null }, "2026-04-08T00:00:00Z")
        expect(first.status).toBe("ok")
        expect(first.deadStreak).toBe(1)

        const second = mergeStatus(first, { status: "dead", finalUrl: null }, "2026-04-15T00:00:00Z")
        expect(second.status).toBe("dead")
        expect(second.deadStreak).toBe(2)
    })

    it("resets dead streak when a run returns ok", () => {
        const prior = { status: "ok", deadStreak: 1, lastChecked: null, finalUrl: null }
        const next = mergeStatus(prior, { status: "ok", finalUrl: null }, "2026-04-15T00:00:00Z")
        expect(next.deadStreak).toBe(0)
    })
})
