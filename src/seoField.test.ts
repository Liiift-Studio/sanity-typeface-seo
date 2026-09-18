/** Unit tests for seoField, seoFieldWithLinks, the sanityImage option and hasSeoImage */
import { describe, it, expect } from 'vitest'
import { seoField } from './seoField'
import { seoFieldWithLinks } from './seoFieldWithLinks'
import { createSeoField } from './createSeoField'
import { hasSeoImage } from './seoImage'

const SHARED_FIELD_NAMES = ['title', 'keywords', 'image', 'description']

describe('seoField', () => {
	it('has correct field identity', () => {
		expect(seoField.name).toBe('social')
		expect(seoField.type).toBe('object')
		expect(seoField.title).toBe('SEO')
	})

	it('is collapsible but not collapsed by default', () => {
		expect(seoField.options.collapsible).toBe(true)
		expect((seoField.options as any).collapsed).toBeUndefined()
	})

	it('contains all expected fields', () => {
		const names = seoField.fields.map(f => f.name)
		for (const name of SHARED_FIELD_NAMES) {
			expect(names).toContain(name)
		}
	})

	it('image field uses cloudinary asset type', () => {
		const imageField = seoField.fields.find(f => f.name === 'image')
		expect(imageField?.type).toBe('cloudinary.asset')
	})

	it('description field is text type', () => {
		const descField = seoField.fields.find(f => f.name === 'description')
		expect(descField?.type).toBe('text')
	})

	it('has exactly 4 fields', () => {
		expect(seoField.fields).toHaveLength(4)
	})
})

describe('seoFieldWithLinks', () => {
	it('has same field identity as seoField', () => {
		expect(seoFieldWithLinks.name).toBe('social')
		expect(seoFieldWithLinks.type).toBe('object')
		expect(seoFieldWithLinks.title).toBe('SEO')
	})

	it('is collapsible but not collapsed by default', () => {
		expect(seoFieldWithLinks.options.collapsible).toBe(true)
		expect((seoFieldWithLinks.options as any).collapsed).toBeUndefined()
	})

	it('contains all base seoField fields', () => {
		const names = seoFieldWithLinks.fields.map(f => f.name)
		for (const name of SHARED_FIELD_NAMES) {
			expect(names).toContain(name)
		}
	})

	it('adds adobeLink and fontStandLink fields', () => {
		const names = seoFieldWithLinks.fields.map(f => f.name)
		expect(names).toContain('adobeLink')
		expect(names).toContain('fontStandLink')
	})

	it('marketplace link fields are string type', () => {
		const adobe = seoFieldWithLinks.fields.find(f => f.name === 'adobeLink')
		const fontStand = seoFieldWithLinks.fields.find(f => f.name === 'fontStandLink')
		expect(adobe?.type).toBe('string')
		expect(fontStand?.type).toBe('string')
	})

	it('is a superset of seoField — has 2 more fields', () => {
		expect(seoFieldWithLinks.fields.length).toBe(seoField.fields.length + 2)
	})
})

describe('createSeoField({ sanityImage: true })', () => {
	const withSanity = createSeoField({ sanityImage: true })
	const names = withSanity.fields.map((f: any) => f.name)

	it('adds a Sanity image field and keeps the Cloudinary one', () => {
		const sanity = withSanity.fields.find((f: any) => f.name === 'sanityImage') as any
		const cloudinary = withSanity.fields.find((f: any) => f.name === 'image') as any
		expect(sanity?.type).toBe('image')
		expect(sanity?.options?.hotspot).toBe(true)
		expect(cloudinary?.type).toBe('cloudinary.asset')
	})

	it('lists the Sanity image first, since it takes priority', () => {
		expect(names.indexOf('sanityImage')).toBe(names.indexOf('image') - 1)
	})

	it('relabels the Cloudinary field so the two are distinguishable', () => {
		const cloudinary = withSanity.fields.find((f: any) => f.name === 'image') as any
		expect(cloudinary.title).toBe('Image (Cloudinary)')
	})

	it('is opt-in — the default field is unchanged', () => {
		const defaults = createSeoField()
		expect(defaults.fields.map((f: any) => f.name)).not.toContain('sanityImage')
		expect((defaults.fields.find((f: any) => f.name === 'image') as any).title).toBe('Image')
	})
})

describe('hasSeoImage', () => {
	it('is true for a Cloudinary image', () => {
		expect(hasSeoImage({ image: { secure_url: 'https://res.cloudinary.com/x.png' } })).toBe(true)
	})

	it('is true for a Sanity image with an asset', () => {
		expect(hasSeoImage({ sanityImage: { _type: 'image', asset: { _ref: 'image-abc-1x1-png' } } })).toBe(true)
	})

	it('is false for a Sanity image whose asset was removed', () => {
		expect(hasSeoImage({ sanityImage: { _type: 'image' } })).toBe(false)
	})

	it('is false for empty, null and undefined values', () => {
		expect(hasSeoImage({})).toBe(false)
		expect(hasSeoImage(null)).toBe(false)
		expect(hasSeoImage(undefined)).toBe(false)
	})
})
