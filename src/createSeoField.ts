/** Factory for the SEO/social Sanity schema field — configurable per document type */
import { resolveSeoImageSource } from './seoImage'
import type { SeoImageSource } from './seoImage'
import type { SeoValue } from './types'

/** Options for createSeoField — all fields default to their most common value */
export interface CreateSeoFieldOptions {
	/** Include the per-page title field. Set false for sitewide defaults (e.g. Settings). Default: true */
	title?: boolean
	/** Include a canonical URL override field. Default: false */
	canonical?: boolean
	/** Include a noIndex toggle — hides the page from search engines. Default: false */
	noIndex?: boolean
	/** Include Darden-specific marketplace links (Adobe Fonts, Font Stand). Default: false */
	marketplaceLinks?: boolean
	/**
	 * Let editors choose where the share image is hosted. Adds an `imageSource` select ("Sanity" /
	 * "Cloudinary") and a Sanity `sanityImage` field; only the selected image input is shown. Both
	 * image fields exist underneath — a Sanity field holds one type, and existing Cloudinary values
	 * must keep validating. Consumers read the source with `resolveSeoImageSource`. Default: false
	 */
	sanityImage?: boolean
	/**
	 * With `sanityImage` on: the source preselected on new documents, and assumed for a document
	 * that has neither a selection nor an image. Default: 'sanity'
	 */
	defaultImageSource?: SeoImageSource
}

/** Editor-facing description shared by both image inputs — only one is ever visible at a time */
const IMAGE_DESCRIPTION =
	'This image is used when the page is shared on social media. Falls back to the sitewide default if not set.'

/** Creates a configurable SEO/social Sanity object field with the given options */
export function createSeoField(options: CreateSeoFieldOptions = {}) {
	const {
		title = true,
		canonical = false,
		noIndex = false,
		marketplaceLinks = false,
		sanityImage = false,
		defaultImageSource = 'sanity',
	} = options

	const fields: object[] = []

	if (title) {
		fields.push({
			title: 'Title',
			name: 'title',
			type: 'string',
			description: 'This will default to the page title if left blank.',
		})
	}

	fields.push({
		title: 'Keywords',
		name: 'keywords',
		type: 'string',
		initialValue: '',
		description: 'An example would be "typography, font, typeface, type, custom font, custom typeface, type foundry, new fonts".',
	})

	if (sanityImage) {
		// One select, one visible image input. Both image fields exist underneath because a Sanity
		// field holds a single type; `hidden` shows only the one the select points at. Switching
		// the select never clears the other field, so a change of mind loses nothing.
		fields.push({
			title: 'Image source',
			name: 'imageSource',
			type: 'string',
			options: {
				list: [
					{ title: 'Sanity', value: 'sanity' },
					{ title: 'Cloudinary', value: 'cloudinary' },
				],
				layout: 'radio',
				direction: 'horizontal',
			},
			initialValue: defaultImageSource,
			description: 'Where the social share image is hosted. Only the selected image is used.',
		})
		fields.push({
			title: 'Image',
			name: 'sanityImage',
			type: 'image',
			options: { hotspot: true },
			description: IMAGE_DESCRIPTION,
			hidden: ({ parent }: { parent?: SeoValue }) =>
				resolveSeoImageSource(parent, defaultImageSource) !== 'sanity',
		})
	}

	fields.push({
		title: 'Image',
		name: 'image',
		type: 'cloudinary.asset',
		description: IMAGE_DESCRIPTION,
		...(sanityImage
			? {
				hidden: ({ parent }: { parent?: SeoValue }) =>
					resolveSeoImageSource(parent, defaultImageSource) !== 'cloudinary',
			}
			: {}),
	})

	if (marketplaceLinks) {
		fields.push({
			title: 'Adobe Fonts Link',
			name: 'adobeLink',
			type: 'string',
			description: 'Link to Adobe Fonts page',
		})
		fields.push({
			title: 'Font Stand Link',
			name: 'fontStandLink',
			type: 'string',
			description: 'Link to Font Stand page',
		})
	}

	fields.push({
		title: 'Description',
		name: 'description',
		type: 'text',
		description: 'Add a description for the page. If left blank, this will default to the website description.',
	})

	if (canonical) {
		fields.push({
			title: 'Canonical URL',
			name: 'canonical',
			type: 'url',
			description: 'Override the canonical URL for this page. Leave blank to use the default page URL.',
		})
	}

	if (noIndex) {
		fields.push({
			title: 'Hide from search engines',
			name: 'noIndex',
			type: 'boolean',
			initialValue: false,
			description: 'When enabled, search engines will not index this page (adds noindex, nofollow meta tags).',
		})
	}

	return {
		title: 'SEO',
		name: 'social',
		type: 'object' as const,
		options: { collapsible: true },
		fields,
	}
}
