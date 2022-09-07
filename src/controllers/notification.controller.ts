import { Request, Response } from 'express'
import { GetNotificationsQuery } from '../schemas/notification.schema'
import { findAllNotifications } from '../services/notification.service'
import { findAndUpdateUser, findUser } from '../services/user.service'
import { logger } from '../utils/logger'

export async function getNotificationController(
	req: Request<{}, {}, {}, GetNotificationsQuery>,
	res: Response
) {
	try {
		const { beforeTime } = req.query
		const createdAtTime = beforeTime || new Date()
		const notifications = await findAllNotifications(
			{
				ownerId: req.user?._id,
				createdAt: { $lt: createdAtTime }
			},
			'',
			{
				sort: { createdAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string)
			}
		)

		return res.status(200).send(notifications)
	} catch (e: any) {
		logger.error(`getNotificationController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function resetNotificationCountController(
	req: Request,
	res: Response
) {
	try {
		const user = await findAndUpdateUser(
			{ _id: req.user?._id },
			{ newNotificationCount: 0 }
		)

		if (!user) {
			return res.status(404).send('User not found!')
		}

		res.status(200).send('success')
	} catch (e: any) {
		logger.error(`resetNotificationCountController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getNotificationCountController(
	req: Request,
	res: Response
) {
	try {
		const user = await findUser({ _id: req.user?._id })

		if (!user) {
			return res.status(404).send('User not found!')
		}

		res.status(200).send({ newNotificationCount: user.newNotificationCount })
	} catch (e: any) {
		logger.error(`getNotificationCountController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}
