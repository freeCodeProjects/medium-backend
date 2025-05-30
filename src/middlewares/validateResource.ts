import { NextFunction, Request, Response } from 'express'
import { AnyZodObject } from 'zod'
import { logger } from '../utils/logger'

export const validateResource =
	(schema: AnyZodObject) =>
	(req: Request, res: Response, next: NextFunction) => {
		try {
			schema.parse({
				body: req.body,
				query: req.query,
				params: req.params
			})
			next()
		} catch (e: any) {
			logger.error('validate Resource Failed.')
			return res.status(400).send(e.errors)
		}
	}
