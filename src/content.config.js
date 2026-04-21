import { defineCollection, z } from "astro:content"
import { file } from "astro/loaders"
import { TYPES } from "./lib/taxonomy.js"

const linkEntrySchema = z.object({
    id: z
        .string()
        .min(1)
        .regex(/^[a-z0-9-]+$/, "id must be lowercase slug with hyphens"),
    title: z.string().min(1),
    url: z.string().url(),
    type: z.enum(TYPES),
    author: z.string().min(1).optional(),
    year: z.number().int().min(1500).max(2100).optional(),
    topics: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
    people: z.array(z.string().regex(/^[a-z0-9-]+$/)).default([]),
    paid: z.boolean().default(false),
    annotation: z.string().min(1),
    added: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "added must be ISO date YYYY-MM-DD")
})

const topicEntrySchema = z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    label: z.string().min(1),
    description: z.string().min(1)
})

const personEntrySchema = z.object({
    slug: z.string().regex(/^[a-z0-9-]+$/),
    name: z.string().min(1),
    aliases: z.array(z.string().min(1)).default([]),
    description: z.string().min(1)
})

const links = defineCollection({
    loader: file("src/data/links.yaml"),
    schema: linkEntrySchema
})

const topics = defineCollection({
    loader: file("src/data/topics.yaml"),
    schema: topicEntrySchema
})

const people = defineCollection({
    loader: file("src/data/people.yaml"),
    schema: personEntrySchema
})

export const collections = { links, topics, people }
