import { Request, Response } from 'express'
import {
	addAuthToken,
	createUser,
	getUserByVerificationId
} from '../services/user.service'
import { CreateUserInput, VerifyUserInput } from '../schemas/user.schema'
import { generateAuthToken } from '../utils/jwt'
import { sendEmail } from '../utils/emailer'
import { signupEmailTemplate } from '../utils/emailTemplate'

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
		return res.status(500).send(e)
	}
}

export async function verifyUserHandler(
	req: Request<{}, {}, {}, VerifyUserInput>,
	res: Response
) {
	const verificationId = req.query.token
	const user = await getUserByVerificationId(verificationId)
	if (!user) {
		res.status(403).send('User with token is not found')
	} else {
		const token = await generateAuthToken({ id: user._id.toString() })
		//add auth token to user document
		await addAuthToken(user._id, token)
		res.status(200).send(token)
	}
}
