import express from 'express'
import {
	AddOrUpdateBlogHandler,
	getBookMarkOrPreviouslyReadHandler,
	GetLatestBlogHandler,
	GetTrendingBlogHandler,
	getUserDraftBlogHandler,
	getUserPublishedBlogHandler,
	PublishBlogHandler
} from '../controllers/blog.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	GetUserDraftBlogSchema,
	GetUserPublishedBlogSchema
} from '../schemas/blog.schema'
import {
	GetBookMarkOrPreviouslyReadSchema,
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

router.get(
	'/api/userDraftBlogs',
	[authMiddleware, validateResource(GetUserDraftBlogSchema)],
	getUserDraftBlogHandler
)

router.get(
	'/api/userPublishedBlogs',
	[authMiddleware, validateResource(GetUserPublishedBlogSchema)],
	getUserPublishedBlogHandler
)

export default router
