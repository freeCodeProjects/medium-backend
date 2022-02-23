import { Request, Response } from 'express'
import {
	createUser,
	findAndUpdateUser,
	findUser
} from '../services/user.service'
import {
	CreateUserInput,
	VerifyUserInput,
	LoginUserInput,
	ResetPasswordMailInput
} from '../schemas/user.schema'
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
import {
	ResetPasswordInput,
	UpdateNameInput,
	UpdateUserBioInput
} from '../schemas/user.schema'
import { imageUploader } from '../utils/fileUploader'
import { IsUserNameUniqueInput } from '../schemas/user.schema'

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
		const buttonURL = `http://localhost:3001/api/verifyUser?token=${token}`
		const htmlData = signupEmailTemplate(buttonURL)
		sendEmail('Medium account verification.', htmlData, user.email, user.name)
		return res.status(200).send('Email send for verification.')
	} catch (e: any) {
		if (e.code === 11000) {
			return res.status(409).send('Account already exists')
		}
		logger.error(`createUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

async function getUserDataWithToken(user: User) {
	const token = await generateAuthToken({ id: user._id.toString() })
	//add auth token to user document
	const newUser = await findAndUpdateUser(
		{ _id: user._id },
		{ $push: { tokens: { token } } },
		{ projection: '-__v -createdAt -updatedAt' }
	)
	const result = {
		newUser,
		token
	}
	return result
}

export async function verifyUserHandler(
	req: Request<{}, {}, {}, VerifyUserInput>,
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
			res.status(404).send('User not Found')
		} else {
			const result = await getUserDataWithToken(user)
			res.status(200).send(result)
		}
	} catch (e: any) {
		logger.error(`verifyUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function loginUserHandler(
	req: Request<{}, {}, LoginUserInput>,
	res: Response
) {
	const body = req.body
	try {
		const user = await findUser({ email: body.email, verified: true })
		if (!user) {
			return res.status(404).send('User not Found')
		} else {
			const passwordMatch = await user.comparePassword(body.password)
			if (!passwordMatch) return res.status(404).send('User not Found')
			const result = await getUserDataWithToken(user)
			return res.status(200).send(result)
		}
	} catch (e: any) {
		logger.error(`loginUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function logoutUserHandler(req: Request, res: Response) {
	try {
		const user = await findAndUpdateUser(
			{ _id: req.user?._id },
			{ $pull: { tokens: { token: req.token } } }
		)
		if (!user) {
			return res.status(404).send('User not Found')
		} else {
			return res.status(200).send('Logout successful.')
		}
	} catch (e: any) {
		logger.error(`logoutUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
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
			return res.status(404).send('User not Found')
		} else {
			const token = encodeBase64(
				JSON.stringify({
					_id: user._id,
					verificationId: newVerificationId
				})
			)
			const buttonURL = `http://localhost:3001/api/resetpassword?token=${token}`
			await sendEmail(
				'Reset password',
				passwordResetTemplate(buttonURL),
				user.email,
				user.name
			)
			return res.status(200).send('Mail send successful.')
		}
	} catch (e: any) {
		logger.error(`resetPasswordMailHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
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
			res.status(404).send('User not Found')
		} else {
			//save is used so that pre hook on save will run
			user.verificationId = ''
			user.password = password
			//remove all the previous auth tokens
			user.tokens = []
			await user.save()

			return res.status(200).send('Password reset successful.')
		}
	} catch (e: any) {
		logger.error(`resetPasswordHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function updateNameHandler(
	req: Request<{}, {}, UpdateNameInput>,
	res: Response
) {
	try {
		const { name } = req.body
		req.user!.name = name
		await req.user!.save()
		return res.status(200).send('Name update successful.')
	} catch (e: any) {
		logger.error(`updateNameHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function updateBioHandler(
	req: Request<{}, {}, UpdateUserBioInput>,
	res: Response
) {
	try {
		const { bio } = req.body
		req.user!.bio = bio
		await req.user!.save()
		return res.status(200).send('Bio update successful.')
	} catch (e: any) {
		logger.error(`updateBioHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function uploadProfileImageHandler(req: Request, res: Response) {
	try {
		const { originalname: name, buffer: file } = req.file!
		const result = await imageUploader(file, name, 'avatar')

		//update the user photo with result url
		req.user!.photo = result.url
		await req.user?.save()
		return res.sendStatus(200)
	} catch (e: any) {
		logger.error(`uploadProfileImageHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function isUserNameUniqueHandler(
	req: Request<{}, {}, IsUserNameUniqueInput>,
	res: Response
) {
	try {
		const result = await findUser({ userName: req.body.userName }, '_id', {
			lean: true
		})
		console.log(result)
		return res.status(200).send({ result })
	} catch (e: any) {
		logger.error(`IsUserNameUniqueHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
