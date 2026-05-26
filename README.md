# sanity-typeface-seo

[![npm version](https://img.shields.io/npm/v/@liiift-studio/sanity-typeface-seo.svg)](https://www.npmjs.com/package/@liiift-studio/sanity-typeface-seo)

Standalone Sanity SEO field definitions for typeface documents. Provides a shared social/SEO object, a visual SEO score evaluator, and optional marketplace link fields — reusable across any foundry studio.

## Install

```bash
npm install @liiift-studio/sanity-typeface-seo
```

## Usage

### Drop-in field

```typescript
import { seoField } from '@liiift-studio/sanity-typeface-seo'
// With marketplace links (Adobe Fonts, Font Stand, etc.)
import { seoFieldWithLinks } from '@liiift-studio/sanity-typeface-seo'

export const typefaceSchema = defineType({
	name: 'typeface',
	type: 'document',
	fields: [
		defineField({ name: 'name', type: 'string' }),
		seoField,
	],
})
```

### Custom field with `createSeoField`

```typescript
import { createSeoField } from '@liiift-studio/sanity-typeface-seo'

const customSeoField = createSeoField({
	title: 'SEO Settings',
	canonical: true,
	noIndex: true,
	marketplaceLinks: true,
})
```

### SEO evaluator component

The evaluator input renders a scoring panel alongside the field editor:

```typescript
import { createSeoEvaluatorInput } from '@liiift-studio/sanity-typeface-seo'

const SeoEvaluatorInput = createSeoEvaluatorInput({
	canonical: true,
	noIndex: true,
	marketplaceLinks: true,
})

export const seoFieldWithEvaluator = defineField({
	name: 'seo',
	type: 'object',
	components: { input: SeoEvaluatorInput },
})
```

**Evaluator panels:**

1. **SEO checklist** — scores title length, description length, keywords, and featured image (0–4, with green/orange/red indicators)
2. **Published diff** — compares draft vs. published SEO values before publishing
3. **Live scan** — optional real-time validation against the published site

## Peer Dependencies

| Package | Version |
|---|---|
| `@sanity/ui` | `>=2` |
| `react` | `>=18` |
| `sanity` | `>=3` |
