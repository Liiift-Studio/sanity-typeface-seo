/** Helpers for the SEO image: a Sanity image (`sanityImage`), with the older Cloudinary asset (`image`) as its fallback */
import type { SeoValue } from './types'

/** Which field an SEO image is read from: the Sanity `sanityImage` or the legacy Cloudinary `image` */
export type SeoImageSource = 'sanity' | 'cloudinary'

/**
 * Works out which field the share image comes from: the Sanity image when it references an asset,
 * otherwise the legacy Cloudinary image when there is one.
 *
 * A Sanity image object can outlive its asset (the field keeps `{ _type: 'image' }` after the file is
 * removed), so `sanityImage` only counts once it references an asset.
 *
 * @param value - the SEO object value
 * @param fallback - the source to report when neither field holds an image. Default: 'sanity'
 */
export function resolveSeoImageSource(
	value: SeoValue | null | undefined,
	fallback: SeoImageSource = 'sanity',
): SeoImageSource {
	if (value?.sanityImage?.asset) return 'sanity'
	if (value?.image) return 'cloudinary'
	return fallback
}

/** Reports whether an SEO value carries a usable share image in either field */
export function hasSeoImage(value: SeoValue | null | undefined): boolean {
	return Boolean(value?.sanityImage?.asset || value?.image)
}
