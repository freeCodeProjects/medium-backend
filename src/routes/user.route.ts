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
	getBookmarkHandler,
	getPreviouslyReadHandler
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
import {
	GetBookmarkBlogSchema,
	GetPreviouslyReadSchema
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

router.post(
	'/api/updateUserName',
	[authMiddleware, validateResource(UpdateUserNameSchema)],
	updateUserNameHandler
)

router.get(
	'/api/bookmarkBlog',
	[authMiddleware, validateResource(GetBookmarkBlogSchema)],
	getBookmarkHandler
)

router.post(
	'/api/bookmarkBlog',
	[authMiddleware, validateResource(BookmarkBlogSchema)],
	addToBookmarkHandler
)

router.delete(
	'/api/bookmarkBlog',
	[authMiddleware, validateResource(BookmarkBlogSchema)],
	removeFromBookmarkHandler
)

router.get(
	'/api/previouslyReadBlog',
	[authMiddleware, validateResource(GetPreviouslyReadSchema)],
	getPreviouslyReadHandler
)

router.post(
	'/api/previouslyReadBlog',
	[authMiddleware, validateResource(PreviouslyReadSchema)],
	previouslyReadHandler
)

export default router
