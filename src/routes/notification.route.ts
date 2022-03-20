import { Router } from 'express'
import { getNotificationController } from '../controllers/notification.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import { GetNotificationsSchema } from '../schemas/notification.schema'

const router = Router()

router.get(
	'/api/notifications',
	[authMiddleware, validateResource(GetNotificationsSchema)],
	getNotificationController
)

export default router
