import express from 'express'
import {
	createUserHandler,
	loginUserHandler,
	logoutUserHandler,
	verifyUserHandler
} from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	CreateUserSchema,
	LoginUserSchema,
	VerifyUserSchema
} from '../schemas/user.schema'

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

router.post('/api/login', validateResource(LoginUserSchema), loginUserHandler)

router.delete('/api/logout', authMiddleware, logoutUserHandler)

export default router
