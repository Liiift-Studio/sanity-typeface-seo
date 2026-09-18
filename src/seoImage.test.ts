/** Unit tests for the Sanity share image: createSeoField({ sanityImage }), resolveSeoImageSource and hasSeoImage */
import { describe, it, expect } from 'vitest'
import { createSeoField } from './createSeoField'
import { hasSeoImage, resolveSeoImageSource } from './seoImage'

/** A Sanity image value that references an asset */
const SANITY_IMAGE = { _type: 'image', asset: { _ref: 'image-abc-1x1-png' } }
/** A Cloudinary asset value, trimmed to what matters here */
const CLOUDINARY_IMAGE = { secure_url: 'https://res.cloudinary.com/x.png' }

describe('createSeoField({ sanityImage: true })', () => {
	const withSanity = createSeoField({ sanityImage: true })
	const field = (name: string) => withSanity.fields.find((f: any) => f.name === name) as any
	const names = withSanity.fields.map((f: any) => f.name)

	it('adds one ordinary Sanity image, always visible', () => {
		expect(field('sanityImage').type).toBe('image')
		expect(field('sanityImage').title).toBe('Image')
		expect(field('sanityImage').options.hotspot).toBe(true)
		expect(field('sanityImage').hidden).toBeUndefined()
	})

	it('has no source select — the image input’s own Select menu lists the sources', () => {
		expect(names).not.toContain('imageSource')
	})

	it('keeps the Cloudinary field in the schema so existing values still validate', () => {
		expect(field('image').type).toBe('cloudinary.asset')
		expect(field('image').title).toBe('Image (legacy Cloudinary)')
		expect(names.indexOf('image')).toBe(names.indexOf('sanityImage') + 1)
	})

	it('shows the legacy Cloudinary field only on documents that already hold a value', () => {
		expect(field('image').hidden({ parent: { image: CLOUDINARY_IMAGE } })).toBe(false)
		expect(field('image').hidden({ parent: { image: CLOUDINARY_IMAGE, sanityImage: SANITY_IMAGE } })).toBe(false)
		expect(field('image').hidden({ parent: { sanityImage: SANITY_IMAGE } })).toBe(true)
		expect(field('image').hidden({ parent: {} })).toBe(true)
		expect(field('image').hidden({ parent: undefined })).toBe(true)
	})

	it('is opt-in — the default field is unchanged and never hidden', () => {
		const defaults = createSeoField()
		expect(defaults.fields.map((f: any) => f.name)).toEqual(['title', 'keywords', 'image', 'description'])
		const image = defaults.fields.find((f: any) => f.name === 'image') as any
		expect(image.title).toBe('Image')
		expect(image.hidden).toBeUndefined()
	})
})

describe('resolveSeoImageSource', () => {
	it('reads the Sanity image first', () => {
		expect(resolveSeoImageSource({ sanityImage: SANITY_IMAGE })).toBe('sanity')
		expect(resolveSeoImageSource({ sanityImage: SANITY_IMAGE, image: CLOUDINARY_IMAGE })).toBe('sanity')
	})

	it('falls back to the legacy Cloudinary image', () => {
		expect(resolveSeoImageSource({ image: CLOUDINARY_IMAGE })).toBe('cloudinary')
	})

	it('ignores a Sanity image whose asset was removed', () => {
		expect(resolveSeoImageSource({ sanityImage: { _type: 'image' }, image: CLOUDINARY_IMAGE })).toBe('cloudinary')
	})

	it('reports the fallback when neither field holds an image', () => {
		expect(resolveSeoImageSource({})).toBe('sanity')
		expect(resolveSeoImageSource(null, 'cloudinary')).toBe('cloudinary')
	})

	it('ignores a stray imageSource left by 1.6.0, which stored the editor’s pick there', () => {
		const stray = { imageSource: 'cloudinary', sanityImage: SANITY_IMAGE } as any
		expect(resolveSeoImageSource(stray)).toBe('sanity')
	})
})

describe('hasSeoImage', () => {
	it('is true for a Cloudinary image', () => {
		expect(hasSeoImage({ image: CLOUDINARY_IMAGE })).toBe(true)
	})

	it('is true for a Sanity image with an asset', () => {
		expect(hasSeoImage({ sanityImage: SANITY_IMAGE })).toBe(true)
	})

	it('is false for a Sanity image whose asset was removed', () => {
		expect(hasSeoImage({ sanityImage: { _type: 'image' } })).toBe(false)
	})

	it('is true when only the legacy image backs an emptied Sanity image', () => {
		expect(hasSeoImage({ sanityImage: { _type: 'image' }, image: CLOUDINARY_IMAGE })).toBe(true)
	})

	it('is false for empty, null and undefined values', () => {
		expect(hasSeoImage({})).toBe(false)
		expect(hasSeoImage(null)).toBe(false)
		expect(hasSeoImage(undefined)).toBe(false)
	})
})
