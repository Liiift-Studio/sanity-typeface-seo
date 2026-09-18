/** Unit tests for the image source select: createSeoField({ sanityImage }), resolveSeoImageSource and hasSeoImage */
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

	it('adds an imageSource radio select with both hosts', () => {
		const source = field('imageSource')
		expect(source.type).toBe('string')
		expect(source.options.layout).toBe('radio')
		expect(source.options.list.map((o: any) => o.value)).toEqual(['sanity', 'cloudinary'])
		expect(source.initialValue).toBe('sanity')
	})

	it('keeps both typed image fields underneath the select', () => {
		expect(field('sanityImage').type).toBe('image')
		expect(field('sanityImage').options.hotspot).toBe(true)
		expect(field('image').type).toBe('cloudinary.asset')
	})

	it('orders the select directly above the two image inputs', () => {
		expect(names.indexOf('sanityImage')).toBe(names.indexOf('imageSource') + 1)
		expect(names.indexOf('image')).toBe(names.indexOf('imageSource') + 2)
	})

	it('gives both image inputs the same label, since only one is ever visible', () => {
		expect(field('sanityImage').title).toBe('Image')
		expect(field('image').title).toBe('Image')
	})

	it('shows exactly one image input for every state of the object', () => {
		const states = [
			{ imageSource: 'sanity' },
			{ imageSource: 'cloudinary' },
			{},
			undefined,
			{ image: CLOUDINARY_IMAGE },
			{ sanityImage: SANITY_IMAGE },
			{ sanityImage: SANITY_IMAGE, image: CLOUDINARY_IMAGE },
			{ imageSource: 'sanity', image: CLOUDINARY_IMAGE },
			{ imageSource: 'cloudinary', sanityImage: SANITY_IMAGE },
		]
		for (const parent of states) {
			const visible = ['sanityImage', 'image'].filter(name => !field(name).hidden({ parent }))
			expect(visible).toHaveLength(1)
		}
	})

	it('follows the select, even when the selected field is still empty', () => {
		expect(field('image').hidden({ parent: { imageSource: 'cloudinary' } })).toBe(false)
		expect(field('sanityImage').hidden({ parent: { imageSource: 'sanity', image: CLOUDINARY_IMAGE } })).toBe(false)
	})

	it('keeps an existing Cloudinary image visible on a document saved before the select existed', () => {
		expect(field('image').hidden({ parent: { image: CLOUDINARY_IMAGE } })).toBe(false)
		expect(field('sanityImage').hidden({ parent: { image: CLOUDINARY_IMAGE } })).toBe(true)
	})

	it('honours defaultImageSource for new and empty documents', () => {
		const cloudFirst = createSeoField({ sanityImage: true, defaultImageSource: 'cloudinary' })
		const get = (name: string) => cloudFirst.fields.find((f: any) => f.name === name) as any
		expect(get('imageSource').initialValue).toBe('cloudinary')
		expect(get('image').hidden({ parent: {} })).toBe(false)
		expect(get('sanityImage').hidden({ parent: {} })).toBe(true)
	})

	it('is opt-in — the default field is unchanged and never hidden', () => {
		const defaults = createSeoField()
		const defaultNames = defaults.fields.map((f: any) => f.name)
		expect(defaultNames).toEqual(['title', 'keywords', 'image', 'description'])
		const image = defaults.fields.find((f: any) => f.name === 'image') as any
		expect(image.title).toBe('Image')
		expect(image.hidden).toBeUndefined()
	})
})

describe('resolveSeoImageSource', () => {
	it('returns an explicit selection even when that field is empty', () => {
		expect(resolveSeoImageSource({ imageSource: 'cloudinary', sanityImage: SANITY_IMAGE })).toBe('cloudinary')
		expect(resolveSeoImageSource({ imageSource: 'sanity', image: CLOUDINARY_IMAGE })).toBe('sanity')
	})

	it('infers the source from whichever image exists when nothing is selected, Sanity first', () => {
		expect(resolveSeoImageSource({ image: CLOUDINARY_IMAGE })).toBe('cloudinary')
		expect(resolveSeoImageSource({ sanityImage: SANITY_IMAGE })).toBe('sanity')
		expect(resolveSeoImageSource({ sanityImage: SANITY_IMAGE, image: CLOUDINARY_IMAGE })).toBe('sanity')
	})

	it('ignores an asset-less Sanity image when inferring', () => {
		expect(resolveSeoImageSource({ sanityImage: { _type: 'image' }, image: CLOUDINARY_IMAGE })).toBe('cloudinary')
	})

	it('falls back for empty values, and ignores an unknown selection', () => {
		expect(resolveSeoImageSource({})).toBe('sanity')
		expect(resolveSeoImageSource(null, 'cloudinary')).toBe('cloudinary')
		expect(resolveSeoImageSource({ imageSource: 'dropbox' as any, image: CLOUDINARY_IMAGE })).toBe('cloudinary')
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

	it('only counts the selected source — an unselected image is not in use', () => {
		expect(hasSeoImage({ imageSource: 'sanity', image: CLOUDINARY_IMAGE })).toBe(false)
		expect(hasSeoImage({ imageSource: 'cloudinary', sanityImage: SANITY_IMAGE })).toBe(false)
		expect(hasSeoImage({ imageSource: 'cloudinary', image: CLOUDINARY_IMAGE })).toBe(true)
	})

	it('is false for empty, null and undefined values', () => {
		expect(hasSeoImage({})).toBe(false)
		expect(hasSeoImage(null)).toBe(false)
		expect(hasSeoImage(undefined)).toBe(false)
	})
})
