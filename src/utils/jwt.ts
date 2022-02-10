import jwt from 'jsonwebtoken'

export async function generateAuthToken(input: { id: string }) {
	const privateKey = Buffer.from(
		process.env.ACCESS_TOKEN_PRIVATE_KEY as string,
		'base64'
	).toString('ascii')
	return jwt.sign(input, privateKey, {
		algorithm: 'RS256',
		expiresIn: '1h'
	})
}

export async function verifyAuthToken(token: string) {
	const publicKey = Buffer.from(
		process.env.ACCESS_TOKEN_PUBLIC_KEY as string,
		'base64'
	).toString('ascii')
	return jwt.verify(token, publicKey)
}
