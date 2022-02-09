import { Request, Response } from 'express'
import { createUser } from '../services/user.service'
import { CreateUserInput } from '../schemas/user.schema'

export async function createUserHandler(
	req: Request<{}, {}, CreateUserInput>,
	res: Response
) {
	const body = req.body
	try {
		const user = await createUser(body)
		return res.status(200).send(user)
	} catch (e: any) {
		if (e.code === 11000) {
			return res.status(409).send('Account already exists')
		}
		return res.status(500).send(e)
	}
}
