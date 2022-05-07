import { Request, Response } from 'express'
import { GetNotificationsInput } from '../schemas/notification.schema'
import { findAllNotifications } from '../services/notification.service'
import { logger } from '../utils/logger'
import { UserProjection } from '../utils/projection'

export async function getNotificationController(
	req: Request<{}, {}, GetNotificationsInput>,
	res: Response
) {
	try {
		const { beforeTime } = req.body
		const createdAtTime = beforeTime || new Date()
		const notifications = await findAllNotifications(
			{
				ownerId: req.user?._id,
				createdAt: { $lt: createdAtTime }
			},
			'',
			{
				sort: { createdAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string),
				lean: true,
				populate: {
					path: 'user',
					select: UserProjection,
					options: { lean: true }
				}
			}
		)

		res.status(200).send(notifications)
	} catch (e: any) {
		logger.error(`getNotificationController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}
