import { Router } from 'express'
import {
	addFollowerController,
	getFollowerController,
	getFollowingOrFollowerHandler,
	removeFollowerController
} from '../controllers/follower.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	GetFollowingOrFollowerSchema,
	GetFollowerSchema
} from '../schemas/follower.schema'
import {
	AddFollowerSchema,
	RemoveFollowerSchema
} from '../schemas/follower.schema'

const router = Router()

router.get(
	'/api/follower/:userId',
	[authMiddleware, validateResource(GetFollowerSchema)],
	getFollowerController
)

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

router.get(
	'/api/followers/:userId',
	[authMiddleware, validateResource(GetFollowingOrFollowerSchema)],
	getFollowingOrFollowerHandler
)

router.get(
	'/api/followings/:userId',
	[authMiddleware, validateResource(GetFollowingOrFollowerSchema)],
	getFollowingOrFollowerHandler
)

export default router
