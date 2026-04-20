#!/usr/bin/env node

function hexToRgb(hex) {
    const h = hex.replace("#", "")
    const n = h.length === 3 ? h.split("").map((c) => c + c).join("") : h
    return {
        r: parseInt(n.slice(0, 2), 16),
        g: parseInt(n.slice(2, 4), 16),
        b: parseInt(n.slice(4, 6), 16)
    }
}

function channelLuminance(v) {
    const c = v / 255
    return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4)
}

export function relativeLuminance(hex) {
    const { r, g, b } = hexToRgb(hex)
    return (
        0.2126 * channelLuminance(r) +
        0.7152 * channelLuminance(g) +
        0.0722 * channelLuminance(b)
    )
}

export function contrastRatio(a, b) {
    const la = relativeLuminance(a)
    const lb = relativeLuminance(b)
    const [hi, lo] = la >= lb ? [la, lb] : [lb, la]
    return (hi + 0.05) / (lo + 0.05)
}

export function passesAA(foreground, background, opts = {}) {
    const required = opts.large ? 3 : 4.5
    return contrastRatio(foreground, background) >= required
}

const DARK = {
    bg: "#0a0a0c",
    "bg-elev": "#121214",
    ink: "#e8e2d6",
    "ink-strong": "#f2ece0",
    "ink-mute": "#998e7a",
    accent: "#c88a8a",
    "accent-bright": "#e0a0a0",
    "accent-mute": "#8a5a5a",
    gold: "#c8a878",
    "gold-mute": "#8a7654"
}

const LIGHT = {
    bg: "#f5efe2",
    "bg-elev": "#ece5d4",
    ink: "#2a241c",
    "ink-strong": "#110d08",
    "ink-mute": "#6a5c46",
    accent: "#8a3a3a",
    "accent-bright": "#a84a4a",
    "accent-mute": "#6a2a2a",
    gold: "#8a6a3a",
    "gold-mute": "#5a4622"
}

const PAIRS = [
    ["ink", "bg"],
    ["ink-strong", "bg"],
    ["ink-mute", "bg"],
    ["accent", "bg"],
    ["accent-bright", "bg"],
    ["ink", "bg-elev"],
    ["accent", "bg-elev"]
]

function checkTheme(name, tokens) {
    const failures = []
    for (const [fg, bg] of PAIRS) {
        const ratio = contrastRatio(tokens[fg], tokens[bg])
        const pass = ratio >= 4.5
        if (!pass) failures.push({ fg, bg, ratio: ratio.toFixed(2) })
    }
    return { name, failures }
}

function main() {
    const results = [checkTheme("dark", DARK), checkTheme("light", LIGHT)]
    let failed = false
    for (const r of results) {
        if (r.failures.length > 0) {
            failed = true
            console.error(`theme ${r.name} has contrast failures:`)
            for (const f of r.failures) {
                console.error(`  --${f.fg} on --${f.bg}: ${f.ratio}`)
            }
        } else {
            console.log(`theme ${r.name} passes AA on all tracked pairs`)
        }
    }
    process.exit(failed ? 1 : 0)
}

if (import.meta.url === `file://${process.argv[1]}`) main()
