export function encodeBase64(data: string) {
	return Buffer.from(`${data}`).toString('base64')
}

export function decodeBase64(token: string): string {
	return Buffer.from(token, 'base64').toString('ascii')
}
