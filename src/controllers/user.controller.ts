import { Request, Response } from 'express'
import {
	addAuthToken,
	createUser,
	getUserByEmail,
	getUserByVerificationId,
	removeAuthToken
} from '../services/user.service'
import {
	CreateUserInput,
	VerifyUserInput,
	LoginUserInput
} from '../schemas/user.schema'
import { generateAuthToken } from '../utils/jwt'
import { sendEmail } from '../utils/emailer'
import { signupEmailTemplate } from '../utils/emailTemplate'
import { logger } from '../utils/logger'
import { User } from '../models/user.model'
import { Types } from 'mongoose'

export async function createUserHandler(
	req: Request<{}, {}, CreateUserInput>,
	res: Response
) {
	const body = req.body
	try {
		const user = await createUser(body)
		const buttonURL = `http://localhost:3001/api/verifyUser?token=${user.verificationId}`
		const htmlData = signupEmailTemplate(buttonURL)
		sendEmail('Medium account verification.', htmlData, user.email, user.name)
		return res.status(200).send(user)
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
	await addAuthToken(user._id, token)
	const result = {
		user: {
			id: user._id,
			email: user.email,
			name: user.name,
			userName: user.userName,
			photo: user.photo,
			bio: user.bio
		},
		token
	}
	return result
}

export async function verifyUserHandler(
	req: Request<{}, {}, {}, VerifyUserInput>,
	res: Response
) {
	const verificationId = req.query.token
	const user = await getUserByVerificationId(verificationId)
	if (!user) {
		res.status(404).send('User not Found')
	} else {
		const result = await getUserDataWithToken(user)
		res.status(200).send(result)
	}
}

export async function loginUserHandler(
	req: Request<{}, {}, LoginUserInput>,
	res: Response
) {
	const body = req.body
	try {
		const user = await getUserByEmail(body.email)
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
		const user = await removeAuthToken(req.user?._id!, req.token!)
		if (!user) {
			return res.status(404).send('User not Found')
		} else {
			return res.status(200).send('Logout successful.')
		}
	} catch (e: any) {
		logger.error(`loginUserHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
