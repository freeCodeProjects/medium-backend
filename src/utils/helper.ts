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
