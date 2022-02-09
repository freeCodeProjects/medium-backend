import UserModel, { User } from '../models/user.model'
import { customAlphabet } from 'nanoid'

export async function createUser(input: Partial<User>) {
	const nanoid = customAlphabet('abcdefghijklmnopqrstuvwxyz', 5)
	const userName = `${input.name}-${nanoid()}`.replace(/ /g, '-')
	const photo = `https://avatars.dicebear.com/api/bottts/${userName}.svg`

	return UserModel.create({
		photo,
		userName,
		...input
	})
}
