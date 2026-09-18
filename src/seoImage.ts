/** Helpers for the SEO image, which an editor sources from Sanity (`sanityImage`) or Cloudinary (`image`) via the `imageSource` select */
import type { SeoValue } from './types'

/** Where an SEO image is hosted. Stored in `imageSource` when createSeoField({ sanityImage: true }) */
export type SeoImageSource = 'sanity' | 'cloudinary'

/** The allowed `imageSource` values, in the order the select lists them */
export const SEO_IMAGE_SOURCES: readonly SeoImageSource[] = ['sanity', 'cloudinary']

/**
 * Works out which image source is in effect for an SEO value.
 *
 * An explicit `imageSource` always wins — that is the editor's choice, even when the chosen field is
 * still empty. Documents saved before the select existed have none, so they fall back to whichever
 * image is present (Sanity first), which keeps an existing Cloudinary image visible and in use.
 *
 * @param value - the SEO object value
 * @param fallback - the source to assume when nothing is chosen and no image exists. Default: 'sanity'
 */
export function resolveSeoImageSource(
	value: SeoValue | null | undefined,
	fallback: SeoImageSource = 'sanity',
): SeoImageSource {
	const chosen = value?.imageSource
	if (chosen === 'sanity' || chosen === 'cloudinary') return chosen
	if (value?.sanityImage?.asset) return 'sanity'
	if (value?.image) return 'cloudinary'
	return fallback
}

/**
 * Reports whether an SEO value carries a usable share image from the source in effect.
 * A Sanity image object can outlive its asset (the field keeps `{ _type: 'image' }` after the file is
 * removed), so `sanityImage` only counts once it references an asset.
 */
export function hasSeoImage(value: SeoValue | null | undefined): boolean {
	return resolveSeoImageSource(value) === 'sanity'
		? Boolean(value?.sanityImage?.asset)
		: Boolean(value?.image)
}
