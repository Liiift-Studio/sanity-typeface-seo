/** Shared types for sanity-typeface-seo field definitions and evaluator */

/** Shape of the SEO object field value in Sanity documents */
export type SeoValue = {
	title?: string
	keywords?: string
	/** Cloudinary asset. The only image unless `sanityImage` is on; then used when imageSource is 'cloudinary' */
	image?: unknown
	/** Editor's choice of image host — only present when createSeoField({ sanityImage: true }). Read via resolveSeoImageSource */
	imageSource?: 'sanity' | 'cloudinary'
	/** Sanity-hosted image — only present when createSeoField({ sanityImage: true }). Used when imageSource is 'sanity' */
	sanityImage?: { asset?: { _ref?: string }; [key: string]: unknown }
	description?: string
	/** Optional canonical URL override — only present when createSeoField({ canonical: true }) */
	canonical?: string
	/** Optional noIndex flag — only present when createSeoField({ noIndex: true }) */
	noIndex?: boolean
	/** Darden-only: link to Adobe Fonts page */
	adobeLink?: string
	/** Darden-only: link to Font Stand page */
	fontStandLink?: string
}

/** Meta tag values extracted from a live page's HTML */
export type SeoScanResult = {
	title: string | null
	description: string | null
	keywords: string | null
	ogTitle: string | null
	ogDescription: string | null
	ogImage: string | null
}

/** Options for createSeoEvaluatorInput factory */
export type SeoEvaluatorOptions = {
	/** Base URL of the live site, e.g. https://dardenstudio.com — enables live scan tab */
	siteUrl?: string
	/** Build the page path from the document slug. Defaults to /typefaces/:slug */
	urlFromSlug?: (slug: string) => string
	/** Sanity field path to read the slug from. Defaults to ['slug', 'current'] */
	slugPath?: string[]
}
