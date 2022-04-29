import multer from 'multer'
import { Request, Response, NextFunction } from 'express'
import { logger } from '../utils/logger'

export const uploadImageMiddleware =
	(size: number, name: string) =>
	(req: Request, res: Response, next: NextFunction) => {
		const uploadProfileImage = multer({
			limits: {
				fileSize: size //1MB
			}
		}).single(name)

		uploadProfileImage(req, res, async function (err) {
			try {
				//if error from Multer
				if (err) {
					throw new Error(err)
				}

				//file is not provided
				if (!req.file) {
					throw new Error('Image is not provided.')
				}

				//check if file type is not image
				if (!/image\/*/.test(req.file?.mimetype)) {
					throw new Error('File is not image type.')
				}
				next()
			} catch (e: any) {
				logger.error(`uploadImageMiddleware ${JSON.stringify(e.message)}`)
				return res.status(400).send({ message: e.message })
			}
		})
	}
