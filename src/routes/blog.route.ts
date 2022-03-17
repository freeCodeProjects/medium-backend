import express from 'express'
import {
	addOrUpdateBlogHandler,
	getBlogBySlugHandler,
	getBookMarkOrPreviouslyReadHandler,
	getLatestBlogHandler,
	getTrendingBlogHandler,
	getUserDraftBlogHandler,
	getUserPublishedBlogHandler,
	publishBlogHandler
} from '../controllers/blog.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	GetBlogBySlugSchema,
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
	addOrUpdateBlogHandler
)

router.post(
	'/api/publishBlog/:id',
	[authMiddleware, validateResource(PublishBlogSchema)],
	publishBlogHandler
)

router.get(
	'/api/getBlogBySlug/:slug',
	[authMiddleware, validateResource(GetBlogBySlugSchema)],
	getBlogBySlugHandler
)

router.get(
	'/api/getLatestBlogs',
	[authMiddleware, validateResource(GetLatestBlogSchema)],
	getLatestBlogHandler
)

router.get('/api/getTrendingBlogs', authMiddleware, getTrendingBlogHandler)

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
