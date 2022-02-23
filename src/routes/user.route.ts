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
	verifyUserHandler,
	isUserNameUniqueHandler,
	updateUserNameHandler
} from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	IsUserNameUniqueSchema,
	UpdateUserBioSchema,
	UpdateUserNameSchema,
	ResetPasswordMailSchema,
	ResetPasswordSchema,
	UpdateNameSchema,
	CreateUserSchema,
	LoginUserSchema,
	VerifyUserSchema
} from '../schemas/user.schema'

import { uploadImageMiddleWare } from '../middlewares/multerUpload'

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
	[authMiddleware, validateResource(UpdateNameSchema)],
	updateNameHandler
)

router.post(
	'/api/updateBio',
	[authMiddleware, validateResource(UpdateUserBioSchema)],
	updateBioHandler
)

router.post(
	'/api/uploadProfileImage',
	[authMiddleware, uploadImageMiddleWare(1048576, 'profile')], //1MB=1048576
	uploadProfileImageHandler
)

router.get(
	'/api/isUserNameUnique',
	[authMiddleware, validateResource(IsUserNameUniqueSchema)],
	isUserNameUniqueHandler
)

router.post(
	'/api/updateUserName',
	[authMiddleware, validateResource(UpdateUserNameSchema)],
	updateUserNameHandler
)

export default router
