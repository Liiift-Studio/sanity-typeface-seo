/** Helpers for the SEO image, which may be a Sanity image (`sanityImage`) or a Cloudinary asset (`image`) */
import type { SeoValue } from './types'

/**
 * Reports whether an SEO value carries a usable share image in either field.
 * A Sanity image object can outlive its asset (the field keeps `{ _type: 'image' }` after the file is
 * removed), so `sanityImage` only counts once it references an asset.
 */
export function hasSeoImage(value: SeoValue | null | undefined): boolean {
	return Boolean(value?.sanityImage?.asset || value?.image)
}
