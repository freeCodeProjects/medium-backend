import express from 'express'
import {
	AddOrUpdateBlogHandler,
	GetLatestBlogHandler,
	GetTrendingBlogHandler,
	PublishBlogHandler
} from '../controllers/blog.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	AddOrUpdateBlogSchema,
	GetLatestBlogSchema,
	PublishBlogSchema
} from '../schemas/blog.schema'

const router = express.Router()

router.post(
	'/api/addOrUpdateBlog/:id?',
	[authMiddleware, validateResource(AddOrUpdateBlogSchema)],
	AddOrUpdateBlogHandler
)

router.post(
	'/api/publishBlog/:id?',
	[authMiddleware, validateResource(PublishBlogSchema)],
	PublishBlogHandler
)

router.get(
	'/api/getLatest',
	[authMiddleware, validateResource(GetLatestBlogSchema)],
	GetLatestBlogHandler
)

router.get('/api/getTrending', authMiddleware, GetTrendingBlogHandler)

export default router
