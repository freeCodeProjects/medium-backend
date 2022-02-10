import UserModel, { User } from '../models/user.model'
import { customAlphabet } from 'nanoid'
import { Types } from 'mongoose'

export async function createUser(input: Partial<User>): Promise<User> {
	const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 5)
	const userName = `${input.name}-${nanoid()}`.replace(/ /g, '-')
	const photo = `https://avatars.dicebear.com/api/bottts/${userName}.svg`

	return UserModel.create({
		photo,
		userName,
		...input
	})
}

export async function getUserByVerificationId(
	verificationId: string
): Promise<User | null> {
	return UserModel.findOneAndUpdate(
		{ verificationId, verified: false },
		{ verificationId: '', verified: true }
	)
}

export async function addAuthToken(_id: Types.ObjectId, token: string) {
	return UserModel.findOneAndUpdate({ _id }, { $push: { tokens: { token } } })
}

export async function removeAuthToken(_id: Types.ObjectId, token: string) {
	return UserModel.findOneAndUpdate({ _id }, { $pull: { tokens: { token } } })
}

export async function getUserByEmail(email: string): Promise<User | null> {
	return UserModel.findOne({ email })
}

export async function getUserByIdAndToken(
	_id: string,
	token: string
): Promise<User | null> {
	return UserModel.findOne({ _id, 'tokens.token': token })
}
