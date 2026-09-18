/** Factory for the SEO/social Sanity schema field — configurable per document type */
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
	 * Make the share image an ordinary Sanity `image` field, `sanityImage`. Its built-in Select menu
	 * offers upload, the media library and — where cloudinaryAssetSourcePlugin() is registered —
	 * Cloudinary, so one field covers every source. The Cloudinary `image` field stays in the schema
	 * as a legacy fallback, visible only on documents that already hold a value. Consumers read
	 * `sanityImage` first, then `image`. Default: false
	 */
	sanityImage?: boolean
}

/** Editor-facing description of the share image input */
const IMAGE_DESCRIPTION =
	'This image is used when the page is shared on social media. Falls back to the sitewide default if not set.'

/** Editor-facing description of the Cloudinary field once `sanityImage` has made it a legacy fallback */
const LEGACY_IMAGE_DESCRIPTION =
	'Set before the Image field above existed, and used only while that field is empty. To retire it, pick the image above, then clear this one.'

/** Creates a configurable SEO/social Sanity object field with the given options */
export function createSeoField(options: CreateSeoFieldOptions = {}) {
	const {
		title = true,
		canonical = false,
		noIndex = false,
		marketplaceLinks = false,
		sanityImage = false,
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
		// One ordinary Sanity image. Its built-in Select menu already offers every source the
		// Studio registers — upload, the media library, and Cloudinary when
		// cloudinaryAssetSourcePlugin() is installed (that source copies the pick into Sanity as a
		// normal image asset). So there is nothing to choose between here: no source select needed.
		fields.push({
			title: 'Image',
			name: 'sanityImage',
			type: 'image',
			options: { hotspot: true },
			description: IMAGE_DESCRIPTION,
		})
	}

	// The Cloudinary field cannot be retyped — other studios use it, and existing values must keep
	// validating. With sanityImage on it becomes a legacy field: shown only on documents that
	// already hold a value, so nothing vanishes, and never offered on the rest.
	fields.push({
		title: sanityImage ? 'Image (legacy Cloudinary)' : 'Image',
		name: 'image',
		type: 'cloudinary.asset',
		description: sanityImage ? LEGACY_IMAGE_DESCRIPTION : IMAGE_DESCRIPTION,
		...(sanityImage
			? { hidden: ({ parent }: { parent?: SeoValue }) => !parent?.image }
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
