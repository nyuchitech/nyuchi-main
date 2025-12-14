/**
 * Content Collections Configuration
 * Define schemas for MDX content types
 */
import { defineCollection, z } from 'astro:content';

const blogCollection = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    description: z.string(),
    author: z.string(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    category: z.enum(['philosophy', 'product', 'community', 'technology', 'culture']),
    tags: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    heroImage: z.string().optional(),
    draft: z.boolean().default(false),
  }),
});

export const collections = {
  blog: blogCollection,
};
