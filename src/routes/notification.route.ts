import { Router } from 'express'
import {
	getNotificationController,
	getNotificationCountController,
	resetNotificationCountController
} from '../controllers/notification.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import { GetNotificationsSchema } from '../schemas/notification.schema'

const router = Router()

router.get(
	'/api/notifications',
	[authMiddleware, validateResource(GetNotificationsSchema)],
	getNotificationController
)

router.get(
	'/api/notification/reset',
	authMiddleware,
	resetNotificationCountController
)

router.get(
	'/api/notification/count',
	authMiddleware,
	getNotificationCountController
)

export default router
