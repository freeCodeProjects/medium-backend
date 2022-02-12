import express from 'express'
import {
	createUserHandler,
	loginUserHandler,
	logoutUserHandler,
	resetPasswordHandler,
	resetPasswordMailHandler,
	verifyUserHandler
} from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	ResetPasswordMailSchema,
	ResetPasswordSchema
} from '../schemas/user.schema'
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

router.post(
	'/api/resetpasswordmail',
	validateResource(ResetPasswordMailSchema),
	resetPasswordMailHandler
)

router.post(
	'/api/resetpassword',
	validateResource(ResetPasswordSchema),
	resetPasswordHandler
)

export default router
