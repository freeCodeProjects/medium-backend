import express from 'express'
import {
	AddOrUpdateBlogHandler,
	getBookMarkOrPreviouslyReadHandler,
	GetLatestBlogHandler,
	GetTrendingBlogHandler,
	PublishBlogHandler
} from '../controllers/blog.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import { GetBookMarkOrPreviouslyReadSchema } from '../schemas/blog.schema'
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

router.get(
	'/api/getBookmarkBlogs',
	[authMiddleware, validateResource(GetBookMarkOrPreviouslyReadSchema)],
	getBookMarkOrPreviouslyReadHandler
)

router.get(
	'/api/getPreviouslyReadBlogs',
	[authMiddleware, validateResource(GetBookMarkOrPreviouslyReadSchema)],
	getBookMarkOrPreviouslyReadHandler
)

export default router
