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
	updateUserNameHandler,
	addToBookmarkHandler,
	removeFromBookmarkHandler,
	previouslyReadHandler,
	deleteUserController,
	getLoginUserHandler,
	getUserByUserNameHandler
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
	VerifyUserSchema,
	BookmarkBlogSchema,
	PreviouslyReadSchema
} from '../schemas/user.schema'
import { uploadImageMiddleWare } from '../middlewares/multerUpload'
import { GetUserByUserNameSchema } from '../schemas/user.schema'

const router = express.Router()

router.post(
	'/api/user/signup',
	validateResource(CreateUserSchema),
	createUserHandler
)

router.get(
	'/api/user/verify',
	validateResource(VerifyUserSchema),
	verifyUserHandler
)

router.post(
	'/api/user/login',
	validateResource(LoginUserSchema),
	loginUserHandler
)

router.get('/api/user/logout', authMiddleware, logoutUserHandler)

router.get('/api/user/loggedIn', authMiddleware, getLoginUserHandler)

router.get(
	'/api/user/userName/:userName',
	validateResource(GetUserByUserNameSchema),
	getUserByUserNameHandler
)

router.post(
	'/api/user/passwordResetMail',
	validateResource(ResetPasswordMailSchema),
	resetPasswordMailHandler
)

router.patch(
	'/api/user/password',
	validateResource(ResetPasswordSchema),
	resetPasswordHandler
)

router.patch(
	'/api/user/name',
	[authMiddleware, validateResource(UpdateNameSchema)],
	updateNameHandler
)

router.patch(
	'/api/user/bio',
	[authMiddleware, validateResource(UpdateUserBioSchema)],
	updateBioHandler
)

router.patch(
	'/api/user/photo',
	[authMiddleware, uploadImageMiddleWare(1048576, 'profile')], //1MB=1048576
	uploadProfileImageHandler
)

router.get(
	'/api/user/isNameUnique',
	[authMiddleware, validateResource(IsUserNameUniqueSchema)],
	isUserNameUniqueHandler
)

router.patch(
	'/api/user/userName',
	[authMiddleware, validateResource(UpdateUserNameSchema)],
	updateUserNameHandler
)

router.patch(
	'/api/user/bookmarkBlog/:blogId',
	[authMiddleware, validateResource(BookmarkBlogSchema)],
	addToBookmarkHandler
)

router.delete(
	'/api/user/bookmarkBlog/:blogId',
	[authMiddleware, validateResource(BookmarkBlogSchema)],
	removeFromBookmarkHandler
)

router.patch(
	'/api/user/previouslyReadBlog/:blogId',
	[authMiddleware, validateResource(PreviouslyReadSchema)],
	previouslyReadHandler
)

router.delete('/api/user', authMiddleware, deleteUserController)

export default router
