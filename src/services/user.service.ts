import UserModel, { User } from '../models/user.model'
import { customAlphabet } from 'nanoid'
import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'

export async function createUser(input: Partial<User>): Promise<User> {
	const nanoid = customAlphabet('1234567890', 5)
	const userName = `${input.name
		?.toLowerCase()
		.replace(' ', '')}${nanoid()}`.replace(/ /g, '-')
	const photo = `https://avatars.dicebear.com/api/bottts/${userName}.svg`

	return UserModel.create({
		photo,
		userName,
		...input
	})
}

export async function findUser(
	query: FilterQuery<User>,
	projection?: any,
	options: QueryOptions = {}
): Promise<User | null> {
	return UserModel.findOne(query, projection, options)
}

export async function findAndUpdateUser(
	condition: FilterQuery<User>,
	update: UpdateQuery<User>,
	options: QueryOptions = {}
): Promise<User | null> {
	const defaultOptions = { lean: true, new: true }
	return UserModel.findOneAndUpdate(condition, update, {
		...defaultOptions,
		...options
	})
}

export async function removeUser(condition: FilterQuery<Comment>) {
	return UserModel.deleteOne(condition)
}
