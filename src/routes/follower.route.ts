import { Router } from 'express'
import {
	addFollowerController,
	removeFollowerController
} from '../controllers/follower.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	AddFollowerSchema,
	RemoveFollowerSchema
} from '../schemas/follower.schema'

const router = Router()

//userId of person to follow
router.post(
	'/api/follower/:userId',
	[authMiddleware, validateResource(AddFollowerSchema)],
	addFollowerController
)

router.delete(
	'/api/follower/:userId',
	[authMiddleware, validateResource(RemoveFollowerSchema)],
	removeFollowerController
)

export default router
