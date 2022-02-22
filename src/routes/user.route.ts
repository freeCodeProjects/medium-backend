import express from 'express'
import {
	createUserHandler,
	loginUserHandler,
	logoutUserHandler,
	resetPasswordHandler,
	resetPasswordMailHandler,
	updateBioHandler,
	uploadProfileImageHandler,
	updateNameHandler,
	verifyUserHandler
} from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import { UpdateUserBioSchema } from '../schemas/user.schema'
import {
	uploadImageMiddleWare
} from '../middlewares/multerUpload'
import {
	ResetPasswordMailSchema,
	ResetPasswordSchema,
	UpdateUserNameSchema
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

router.post(
	'/api/updateName',
	[authMiddleware, validateResource(UpdateUserNameSchema)],
	updateNameHandler
)

router.post(
	'/api/updateBio',
	[authMiddleware, validateResource(UpdateUserBioSchema)],
	updateBioHandler
)

router.post(
	'/uploadProfileImage',
	[authMiddleware, uploadImageMiddleWare(1048576, 'profile')], //1MB=1048576
	uploadProfileImageHandler
)

export default router
