import express from 'express'
import { createUserHandler } from '../controllers/user.controller'
import { validateResource } from '../middlewares/validateResource'
import { CreateUserSchema } from '../schemas/user.schema'

const router = express.Router()

router.post(
	'/api/signup',
	validateResource(CreateUserSchema),
	createUserHandler
)

export default router
