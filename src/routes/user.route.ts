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
	isUserNameUniqueHandler
} from '../controllers/user.controller'
import { authMiddleware } from '../middlewares/authMiddleware'
import { validateResource } from '../middlewares/validateResource'
import {
	IsUserNameUniqueSchema,
	UpdateUserBioSchema
} from '../schemas/user.schema'
import { uploadImageMiddleWare } from '../middlewares/multerUpload'
import {
	ResetPasswordMailSchema,
	ResetPasswordSchema,
	UpdateNameSchema
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

export default router
