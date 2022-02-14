import express from 'express'
import { AddOrUpdateBlogHandler } from '../controllers/blog.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import { AddOrUpdateBlogSchema } from '../schemas/blog.schema'

const router = express.Router()

router.post(
	'/api/addOrUpdateBlog/:id?',
	[authMiddleware, validateResource(AddOrUpdateBlogSchema)],
	AddOrUpdateBlogHandler
)

export default router
