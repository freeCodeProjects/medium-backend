import express from 'express'
import {
	AddOrUpdateBlogHandler,
	GetLatestBlogHandler
} from '../controllers/blog.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	AddOrUpdateBlogSchema,
	GetLatestBlogSchema
} from '../schemas/blog.schema'

const router = express.Router()

router.post(
	'/api/addOrUpdateBlog/:id?',
	[authMiddleware, validateResource(AddOrUpdateBlogSchema)],
	AddOrUpdateBlogHandler
)

router.get(
	'/api/getLatest',
	[authMiddleware, validateResource(GetLatestBlogSchema)],
	GetLatestBlogHandler
)

export default router
