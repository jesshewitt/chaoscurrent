import { describe, it, expect } from "vitest"
import { classify } from "../scripts/check-links.mjs"

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

    it("returns dead for 404, 410, or 5xx", () => {
        expect(classify({ ok: false, status: 404 }).status).toBe("dead")
        expect(classify({ ok: false, status: 410 }).status).toBe("dead")
        expect(classify({ ok: false, status: 503 }).status).toBe("dead")
    })

    it("returns blocked for 401 or 403 rather than dead", () => {
        expect(classify({ ok: false, status: 401 }).status).toBe("blocked")
        expect(classify({ ok: false, status: 403 }).status).toBe("blocked")
    })

    it("returns slow on timeout after retry", () => {
        expect(classify({ timedOut: true }).status).toBe("slow")
    })
})
