import { Router } from 'express'
import {
	addCommentController,
	deleteCommentController,
	getLatestCommentController,
	getTopCommentController,
	updateCommentController
} from '../controllers/comment.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	DeleteCommentSchema,
	GetTopCommentSchema,
	GetLatestCommentSchema
} from '../schemas/comment.schema'
import {
	AddCommentSchema,
	UpdateCommentSchema
} from '../schemas/comment.schema'

const router = Router()

router.get(
	'/api/topComments',
	[authMiddleware, validateResource(GetTopCommentSchema)],
	getTopCommentController
)

router.get(
	'/api/latestComments',
	[authMiddleware, validateResource(GetLatestCommentSchema)],
	getLatestCommentController
)

router.post(
	'/api/comment',
	[authMiddleware, validateResource(AddCommentSchema)],
	addCommentController
)

router.patch(
	'/api/comment/:id',
	[authMiddleware, validateResource(UpdateCommentSchema)],
	updateCommentController
)

router.delete(
	'/api/comment/:id',
	[authMiddleware, validateResource(DeleteCommentSchema)],
	deleteCommentController
)

export default router
