import express from 'express'
import { addClapHandler, getClapHandler } from '../controllers/clap.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import { AddClapSchema, GetClapSchema } from '../schemas/clap.schema'

const router = express.Router()

router.get(
	'/api/clap/:postId',
	[authMiddleware, validateResource(GetClapSchema)],
	getClapHandler
)

router.post(
	'/api/clap/:postId',
	[authMiddleware, validateResource(AddClapSchema)],
	addClapHandler
)

export default router
