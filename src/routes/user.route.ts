import express from 'express'
import {
	createUserHandler,
	verifyUserHandler
} from '../controllers/user.controller'
import { validateResource } from '../middlewares/validateResource'
import { CreateUserSchema, VerifyUserSchema } from '../schemas/user.schema'

const router = express.Router()

router.post(
	'/api/signup',
	validateResource(CreateUserSchema),
	createUserHandler
)

router.get(
	'/api/verifyUser',
	validateResource(VerifyUserSchema),
	verifyUserHandler
)

export default router
