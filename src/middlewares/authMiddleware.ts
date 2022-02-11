import { NextFunction, Request, Response } from 'express'
import { findUser } from '../services/user.service'
import { verifyAuthToken } from '../utils/jwt'

export async function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const token = req.headers.authorization?.replace('Bearer ', '') || ''
		if (!token) {
			return res.status(403).send('A token is required for authentication')
		}
		const decode = await verifyAuthToken(token)
		const user = await findUser({
			_id: (<{ id: string }>decode).id,
			'tokens.token': token
		})
		if (!user) {
			throw new Error()
		}
		req.token = token
		req.user = user
		next()
	} catch (e) {
		res.status(401).send({ error: 'Please authenticate.' })
	}
}
