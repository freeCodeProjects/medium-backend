import { Router } from 'express'
import {
	addCommentController,
	deleteCommentController,
	getCommentsController,
	updateCommentController
} from '../controllers/comment.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	DeleteCommentSchema,
	GetCommentsSchema,
	AddCommentSchema,
	UpdateCommentSchema
} from '../schemas/comment.schema'

const router = Router()

router.get(
	'/api/comments',
	validateResource(GetCommentsSchema),
	getCommentsController
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
