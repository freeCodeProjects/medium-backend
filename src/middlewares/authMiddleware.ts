import { NextFunction, Request, Response } from 'express'
import { findUser } from '../services/user.service'
import { verifyAuthToken } from '../utils/jwt'
import { logger } from '../utils/logger'

export async function authMiddleware(
	req: Request,
	res: Response,
	next: NextFunction
) {
	try {
		const token =
			req?.cookies?.authToken ||
			req.headers.authorization?.replace('Bearer ', '') ||
			''
		if (!token) {
			return res
				.status(403)
				.send({ message: 'Auth Token is missing. Please authenticate.' })
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
		res.clearCookie('authToken', { path: '/' })
		return res.status(401).send({ message: 'Please authenticate.' })
	}
}

export async function authMiddlewareWithoutError(
	req: Request,
	res: Response,
	next: NextFunction
) {
	const token =
		req?.cookies?.authToken ||
		req.headers.authorization?.replace('Bearer ', '') ||
		''
	if (!token) {
		return next()
	}

	try {
		const decode = await verifyAuthToken(token)
		const user = await findUser({
			_id: (<{ id: string }>decode).id,
			'tokens.token': token
		})
		if (!user) {
			return next()
		}
		req.token = token
		req.user = user
	} catch (error) {
		logger.error(`authMiddlewareWithoutError : ${error}`)
	} finally {
		return next()
	}
}
