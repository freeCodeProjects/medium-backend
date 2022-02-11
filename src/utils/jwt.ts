import jwt from 'jsonwebtoken'
import { decodeBase64 } from './helper'

export async function generateAuthToken(input: { id: string }) {
	const privateKey = decodeBase64(
		process.env.ACCESS_TOKEN_PRIVATE_KEY as string
	) as string
	return jwt.sign(input, privateKey, {
		algorithm: 'RS256',
		expiresIn: '1h'
	})
}

export async function verifyAuthToken(token: string) {
	const publicKey = decodeBase64(
		process.env.ACCESS_TOKEN_PUBLIC_KEY as string
	) as string
	return jwt.verify(token, publicKey)
}
