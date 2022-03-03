import express from 'express'
import { addClapHandler, getClapHandler } from '../controllers/clap.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import { AddClapSchema, GetClapSchema } from '../schemas/clap.schema'

const router = express.Router()

router.get(
	'/api/clap/:blogId',
	[authMiddleware, validateResource(GetClapSchema)],
	getClapHandler
)

router.post(
	'/api/clap/:blogId',
	[authMiddleware, validateResource(AddClapSchema)],
	addClapHandler
)

export default router
