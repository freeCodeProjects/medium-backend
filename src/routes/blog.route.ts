import express from 'express'
import {
	addBlogHandler,
	deleteBlogController,
	getBlogByIdHandler,
	getBlogBySlugHandler,
	getBookMarkOrPreviouslyReadHandler,
	getLatestBlogHandler,
	getTrendingBlogHandler,
	getUserDraftBlogHandler,
	getUserPublishedBlogHandler,
	publishBlogHandler,
	updateBlogHandler,
	uploadEditorImageFileHandler,
	uploadEditorImageUrlHandler
} from '../controllers/blog.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { uploadImageMiddleware } from '../middlewares/multerUpload'
import { validateResource } from '../middlewares/validateResource'
import { UploadEditorImageUrlSchema } from '../schemas/blog.schema'
import {
	AddBlogSchema,
	DeleteBlogSchema,
	GetBlogByIdSchema,
	UpdateBlogSchema
} from '../schemas/blog.schema'
import {
	GetBlogBySlugSchema,
	GetUserDraftBlogSchema,
	GetUserPublishedBlogSchema,
	GetBookMarkOrPreviouslyReadSchema,
	GetLatestBlogSchema,
	PublishBlogSchema
} from '../schemas/blog.schema'

const router = express.Router()

router.post(
	'/api/blog',
	[authMiddleware, validateResource(AddBlogSchema)],
	addBlogHandler
)

router.patch(
	'/api/blog/:id',
	[authMiddleware, validateResource(UpdateBlogSchema)],
	updateBlogHandler
)

router.get(
	'/api/blog/:id',
	[authMiddleware, validateResource(GetBlogByIdSchema)],
	getBlogByIdHandler
)

router.post(
	'/api/blog/publishBlog/:id',
	[authMiddleware, validateResource(PublishBlogSchema)],
	publishBlogHandler
)

router.get(
	'/api/blog/slug/:slug',
	[authMiddleware, validateResource(GetBlogBySlugSchema)],
	getBlogBySlugHandler
)

router.get(
	'/api/blog/latest',
	[authMiddleware, validateResource(GetLatestBlogSchema)],
	getLatestBlogHandler
)

router.get('/api/blog/trending', authMiddleware, getTrendingBlogHandler)

router.get(
	'/api/blog/bookmarks',
	[authMiddleware, validateResource(GetBookMarkOrPreviouslyReadSchema)],
	getBookMarkOrPreviouslyReadHandler
)

router.get(
	'/api/blog/previouslyRead',
	[authMiddleware, validateResource(GetBookMarkOrPreviouslyReadSchema)],
	getBookMarkOrPreviouslyReadHandler
)

router.get(
	'/api/blog/draft',
	[authMiddleware, validateResource(GetUserDraftBlogSchema)],
	getUserDraftBlogHandler
)

router.get(
	'/api/blog/published',
	[authMiddleware, validateResource(GetUserPublishedBlogSchema)],
	getUserPublishedBlogHandler
)

router.delete(
	'/api/blog/:id',
	[authMiddleware, validateResource(DeleteBlogSchema)],
	deleteBlogController
)

router.post(
	'/api/blog/editor/imageFile',
	[authMiddleware, uploadImageMiddleware(3145728, 'image')],
	uploadEditorImageFileHandler
)

router.post(
	'/api/blog/editor/imageUrl',
	[authMiddleware, validateResource(UploadEditorImageUrlSchema)],
	uploadEditorImageUrlHandler
)

export default router
