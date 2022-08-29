import express from 'express'
import {
	addBlogHandler,
	deleteBlogController,
	editorIframeHeightHandler,
	editorLinkHandler,
	getBlogByIdHandler,
	getBlogBySlugHandler,
	getLatestBlogHandler,
	getTrendingBlogHandler,
	getUserBlogsHandler,
	getUserListHandler,
	getUserPublicBlogHandler,
	publishBlogHandler,
	updateBlogHandler,
	uploadEditorImageFileHandler,
	uploadEditorImageUrlHandler
} from '../controllers/blog.controller'
import {
	authMiddleware,
	authMiddlewareWithoutError
} from '../middlewares/authMiddleware'
import { uploadImageMiddleware } from '../middlewares/multerUpload'
import { validateResource } from '../middlewares/validateResource'
import { GetUserPublicBlogSchema } from '../schemas/blog.schema'
import {
	EditorLinkSchema,
	GetUserBlogsSchema,
	GetUserListSchema
} from '../schemas/blog.schema'
import {
	UploadEditorImageUrlSchema,
	EditorIframeHeightSchema
} from '../schemas/blog.schema'
import {
	AddBlogSchema,
	DeleteBlogSchema,
	GetBlogByIdSchema,
	UpdateBlogSchema
} from '../schemas/blog.schema'
import {
	GetBlogBySlugSchema,
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

router.post(
	'/api/blog/publish/:id',
	[authMiddleware, validateResource(PublishBlogSchema)],
	publishBlogHandler
)

router.get(
	'/api/blog/slug/:slug',
	[validateResource(GetBlogBySlugSchema)],
	getBlogBySlugHandler
)

router.get(
	'/api/blog/latest',
	[validateResource(GetLatestBlogSchema)],
	getLatestBlogHandler
)

router.get('/api/blog/trending', getTrendingBlogHandler)

router.get(
	'/api/user/list',
	[authMiddleware, validateResource(GetUserListSchema)],
	getUserListHandler
)

router.get(
	'/api/user/blogs',
	[authMiddleware, validateResource(GetUserBlogsSchema)],
	getUserBlogsHandler
)

router.get(
	'/api/user/publicBlogs',
	[validateResource(GetUserPublicBlogSchema)],
	getUserPublicBlogHandler
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

router.get(
	'/api/blog/editor/iframeHeight',
	[authMiddlewareWithoutError, validateResource(EditorIframeHeightSchema)],
	editorIframeHeightHandler
)

router.get(
	'/api/blog/editor/fetchUrl',
	validateResource(EditorLinkSchema),
	editorLinkHandler
)

router.get(
	'/api/blog/getById/:id',
	[authMiddleware, validateResource(GetBlogByIdSchema)],
	getBlogByIdHandler
)

export default router
