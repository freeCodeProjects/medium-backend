import slugify from 'slugify'
import { nanoid } from 'nanoid'

export function encodeBase64(data: string) {
	return Buffer.from(`${data}`).toString('base64')
}

export function decodeBase64(token: string): string {
	return Buffer.from(token, 'base64').toString('ascii')
}

//return time to read blog in minutes
export function getReadingTime(content: any): number {
	// condition when content is empty or blocks were empty
	if (!content.blocks || content.blocks.length === 0) {
		return 0
	}

	const wps = 265
	const perImageTime = 10
	let wordCount = 0
	let imageTime = 0
	for (const block of content.blocks) {
		if (
			block.type === 'header' ||
			block.type === 'paragraph' ||
			block.type === 'quote'
		) {
			const text = block.data.text
			wordCount += text.split(' ').length
		} else if (block.type === 'list') {
			for (const text of block.data.items) {
				wordCount += text.split(' ').length
			}
		} else if (block.type === 'image') {
			imageTime += perImageTime
		}
	}
	return Math.max(Math.ceil(wordCount / wps + imageTime / 60), 1)
}

export const generateSlug = (text: string) => {
	return `${slugify(text, { strict: true, lower: true })}-${nanoid(12)}`
}

//for some url e.g - https://miro.medium.com/max/1400/0*cI5eoFps4thgr01A.jpeg buffer type is 'text/html' so we will allow isFileImage check for both 'image/...' and 'text/html' this is not perfect but something is better than nothing. This problem exists on backend only
export const isFileImage = (file: File | Blob) => {
	return (file && file['type'].split('/')[0] === 'image') || 'text'
}

export const validateFileSize = (file: File | Blob, sizeInMB: number) => {
	let size = file.size / (1024 * 1024)
	return size < sizeInMB
}
