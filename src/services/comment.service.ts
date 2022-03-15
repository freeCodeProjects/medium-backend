import CommentModel, { Comment } from '../models/comment.model'
import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'

export async function addComment(data: Partial<Comment>): Promise<Comment> {
	return CommentModel.create(data)
}

export async function findComment(
	query: FilterQuery<Comment>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Comment | null> {
	const defaultOptions = { lean: true }
	return CommentModel.findOne(query, projection, {
		...defaultOptions,
		...options
	})
}

export async function findAllComment(
	query: FilterQuery<Comment>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Comment[]> {
	const defaultOptions = { lean: true }
	return CommentModel.find(query, projection, {
		...defaultOptions,
		...options
	})
}

export async function findAndUpdateComment(
	condition: FilterQuery<Comment>,
	update: UpdateQuery<Comment>,
	options: QueryOptions = {}
): Promise<Comment | null> {
	const defaultOptions = { lean: true, new: true }
	return CommentModel.findOneAndUpdate(condition, update, {
		...defaultOptions,
		...options
	})
}

export async function removeComment(_id: string) {
	return CommentModel.deleteOne({ _id })
}
