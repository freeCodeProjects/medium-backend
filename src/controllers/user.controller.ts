import { Request, Response } from 'express'
import {
	createUser,
	findAndUpdateUser,
	findUser,
	removeUser
} from '../services/user.service'
import { generateAuthToken } from '../utils/jwt'
import { sendEmail } from '../utils/emailer'
import {
	passwordResetTemplate,
	signupEmailTemplate
} from '../utils/emailTemplate'
import { logger } from '../utils/logger'
import { User } from '../models/user.model'
import { nanoid } from 'nanoid'
import { decodeBase64, encodeBase64 } from '../utils/helper'
import { imageUploader } from '../utils/fileUploader'
import {
	CreateUserInput,
	LoginUserInput,
	ResetPasswordMailInput,
	ResetPasswordInput,
	UpdateNameInput,
	UpdateUserBioInput,
	BookmarkBlogParams,
	UpdateUserNameInput,
	PreviouslyReadParams,
	VerifyUserQuery,
	IsUserNameUniqueQuery,
	GetUserByIdParams
} from '../schemas/user.schema'
import { UserProjection } from '../utils/projection'
import { Types } from 'mongoose'
import { GetUserByUserNameParams } from '../schemas/user.schema'

const LoggedInUserProjection = `${UserProjection} bookmarks`

export async function createUserHandler(
	req: Request<{}, {}, CreateUserInput>,
	res: Response
) {
	const body = req.body
	try {
		const user = await createUser(body)
		const token = encodeBase64(
			JSON.stringify({
				_id: user._id,
				verificationId: user.verificationId
			})
		)
		const buttonURL = `${process.env.ORIGIN_URL}/verifyUser?token=${token}`
		const htmlData = signupEmailTemplate(buttonURL)
		sendEmail('Medium account verification.', htmlData, user.email, user.name)
		return res.status(200).send({ message: 'Email send for verification.' })
	} catch (e: any) {
		if (e.code === 11000) {
			return res.status(409).send({ message: 'Account already exists' })
		}
		logger.error(`createUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

async function getUserDataWithToken(user: User) {
	const token = await generateAuthToken({ id: user._id.toString() })
	//add auth token to user document
	const userData = await findAndUpdateUser(
		{ _id: user._id },
		{ $push: { tokens: { token } } },
		{ projection: LoggedInUserProjection }
	)
	const result = {
		userData,
		token
	}
	return result
}

export async function verifyUserHandler(
	req: Request<{}, {}, {}, VerifyUserQuery>,
	res: Response
) {
	try {
		//tokenData {_id: 'df...aq', verificationId: 'dfs...ytu'}
		const tokenData = JSON.parse(decodeBase64(req.query.token))
		//mark user as verified
		const user = await findAndUpdateUser(
			{ ...tokenData, verified: false },
			{ verificationId: '', verified: true }
		)
		if (!user) {
			res.status(404).send({ message: 'User not Found.' })
		} else {
			const { userData, token } = await getUserDataWithToken(user)

			res.cookie('authToken', token, {
				httpOnly: true,
				secure: process.env.SECURE_COOKIE === 'true',
				maxAge: parseInt(process.env.MAXAGE_COOKIE!),
				domain: process.env.DOMAIN,
				sameSite: 'strict'
			})
			res.status(200).send({ user: userData })
		}
	} catch (e: any) {
		logger.error(`verifyUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function loginUserHandler(
	req: Request<{}, {}, LoginUserInput>,
	res: Response
) {
	const body = req.body
	try {
		const user = await findUser({ email: body.email })
		if (!user) {
			return res.status(404).send({ message: 'User not Found' })
		} else {
			if (!user?.verified) {
				return res.status(401).send({ message: 'Account not verified.' })
			}
			const passwordMatch = await user.comparePassword(body.password)
			if (!passwordMatch)
				return res.status(404).send({ message: 'User not Found' })
			const { userData, token } = await getUserDataWithToken(user)

			res.cookie('authToken', token, {
				httpOnly: true,
				secure: process.env.SECURE_COOKIE === 'true',
				maxAge: parseInt(process.env.MAXAGE_COOKIE!),
				domain: process.env.DOMAIN,
				sameSite: 'strict'
			})
			res.status(200).send({ user: userData })
		}
	} catch (e: any) {
		logger.error(`loginUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getLoginUserHandler(req: Request, res: Response) {
	try {
		const {
			_id,
			name,
			bio,
			userName,
			photo,
			followerCount,
			followingCount,
			bookmarks
		} = req.user!
		return res.status(200).send({
			user: {
				_id,
				name,
				bio,
				userName,
				photo,
				followerCount,
				followingCount,
				bookmarks
			}
		})
	} catch (e: any) {
		logger.error(`logoutUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getUserByIdHandler(
	req: Request<GetUserByIdParams>,
	res: Response
) {
	try {
		const user = await findUser({ _id: req.params.id }, UserProjection)
		if (!user) {
			return res.status(404).send('User not found.')
		} else {
			return res.status(200).send(user)
		}
	} catch (e: any) {
		logger.error(`getUserByIdHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getUserByUserNameHandler(
	req: Request<GetUserByUserNameParams>,
	res: Response
) {
	try {
		const user = await findUser(
			{ userName: req.params.userName },
			UserProjection
		)
		if (!user) {
			return res.status(404).send('User not found.')
		} else {
			return res.status(200).send(user)
		}
	} catch (e: any) {
		logger.error(`getUserByUserNameHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function logoutUserHandler(req: Request, res: Response) {
	try {
		await findAndUpdateUser(
			{ _id: req.user?._id },
			{ $pull: { tokens: { token: req.token } } }
		)
		res.clearCookie('authToken', { path: '/' })
		return res.status(200).send({ message: 'Logout successful.' })
	} catch (e: any) {
		logger.error(`logoutUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function resetPasswordMailHandler(
	req: Request<{}, {}, ResetPasswordMailInput>,
	res: Response
) {
	try {
		const body = req.body
		const newVerificationId = nanoid()
		const user = await findAndUpdateUser(
			{ email: body.email },
			{ verificationId: newVerificationId }
		)
		if (!user) {
			return res.status(404).send({ message: 'User not Found' })
		} else {
			const token = encodeBase64(
				JSON.stringify({
					_id: user._id,
					verificationId: newVerificationId
				})
			)
			const buttonURL = `${process.env.ORIGIN_URL}/resetpassword?token=${token}`
			await sendEmail(
				'Reset password',
				passwordResetTemplate(buttonURL),
				user.email,
				user.name
			)
			return res
				.status(200)
				.send({ message: 'Email send with link to reset password' })
		}
	} catch (e: any) {
		logger.error(`resetPasswordMailHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function resetPasswordHandler(
	req: Request<{}, {}, ResetPasswordInput>,
	res: Response
) {
	try {
		const { token, password } = req.body
		//tokenData {_id: 'df...aq', verificationId: 'dfs...ytu'}
		const tokenData = JSON.parse(decodeBase64(token))
		//mark user as verified
		const user = await findUser({ ...tokenData })
		if (!user) {
			res.status(404).send({ message: 'User not Found' })
		} else {
			//save is used so that pre hook on save will run
			user.verificationId = ''
			user.password = password
			//remove all the previous auth tokens
			user.tokens = []
			await user.save()

			return res.status(200).send({ message: 'Password reset successful.' })
		}
	} catch (e: any) {
		logger.error(`resetPasswordHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function updateNameHandler(
	req: Request<{}, {}, UpdateNameInput>,
	res: Response
) {
	try {
		const { name } = req.body

		const user = await findAndUpdateUser(
			{ _id: req.user?._id },
			{ name },
			{
				projection: LoggedInUserProjection
			}
		)
		return res.status(200).send({ user })
	} catch (e: any) {
		logger.error(`updateNameHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function updateBioHandler(
	req: Request<{}, {}, UpdateUserBioInput>,
	res: Response
) {
	try {
		const { bio } = req.body
		const user = await findAndUpdateUser(
			{ _id: req.user?._id },
			{ bio },
			{
				projection: LoggedInUserProjection
			}
		)
		return res.status(200).send({ user })
	} catch (e: any) {
		logger.error(`updateBioHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function uploadProfileImageHandler(req: Request, res: Response) {
	try {
		const { buffer: file } = req.file!
		const ext = req.file?.mimetype.split('/')[1] || ''

		//replace existing image file
		const result = await imageUploader(
			file,
			req.user?._id.toHexString()! + '.' + ext,
			'avatar',
			false
		)

		//since the image url is same adding random id will force browser to refetch image otherwise image will not update on browser
		const newImageUrl = `${result.url}?fileId=${nanoid()}`

		//update the user photo with result url
		const user = await findAndUpdateUser(
			{ _id: req.user?._id },
			{ photo: newImageUrl },
			{
				projection: LoggedInUserProjection
			}
		)
		return res.status(200).send({ user })
	} catch (e: any) {
		logger.error(`uploadProfileImageHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function isUserNameUniqueHandler(
	req: Request<{}, {}, {}, IsUserNameUniqueQuery>,
	res: Response
) {
	try {
		const result = await findUser({ userName: req.query.userName }, '_id', {
			lean: true
		})
		return res.status(200).send({ isUnique: result ? false : true })
	} catch (e: any) {
		logger.error(`IsUserNameUniqueHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function updateUserNameHandler(
	req: Request<{}, {}, UpdateUserNameInput>,
	res: Response
) {
	try {
		const { userName } = req.body
		const user = await findAndUpdateUser(
			{ _id: req.user?._id },
			{ userName },
			{
				projection: LoggedInUserProjection
			}
		)
		return res.status(200).send({ user })
	} catch (e: any) {
		logger.error(`updateNameHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function addToBookmarkHandler(
	req: Request<BookmarkBlogParams>,
	res: Response
) {
	try {
		const { blogId } = req.params
		const user = await findAndUpdateUser(
			{ _id: req.user?._id },
			{ $addToSet: { bookmarks: blogId } },
			{ projection: LoggedInUserProjection }
		)
		return res.status(200).send(user)
	} catch (e: any) {
		logger.error(`addToBookmarkHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function removeFromBookmarkHandler(
	req: Request<BookmarkBlogParams>,
	res: Response
) {
	try {
		const { blogId } = req.params
		const user = await findAndUpdateUser(
			{ _id: req.user?._id },
			{ $pull: { bookmarks: blogId } },
			{ projection: LoggedInUserProjection }
		)
		return res.status(200).send(user)
	} catch (e: any) {
		logger.error(`removeFromBookmarkHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function previouslyReadHandler(
	req: Request<PreviouslyReadParams>,
	res: Response
) {
	try {
		const user = req.user!
		const { blogId } = req.params

		//remove the id if already exists
		user.previouslyRead = user.previouslyRead.filter(
			(id) => id.toString() !== blogId
		)

		//add the blogId to end
		user.previouslyRead.push(new Types.ObjectId(blogId))

		await user.save()
		return res.status(200).send('Added to previously read.')
	} catch (e: any) {
		logger.error(`previouslyReadHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function deleteUserController(req: Request, res: Response) {
	try {
		const result = await removeUser({
			_id: req.user?._id
		})

		res.status(200).send({ result })
	} catch (e: any) {
		logger.error(`deleteUserController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}
