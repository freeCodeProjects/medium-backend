import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'
import BlogModel, { Blog } from '../models/blog.model'

export async function findAllBlog(
	query: FilterQuery<Blog>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Blog[] | null> {
	const defaultOptions = { lean: true }
	return BlogModel.find(query, projection, {
		...defaultOptions,
		...options
	})
}

export async function findBlog(
	query: FilterQuery<Blog>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Blog | null> {
	const defaultOptions = { lean: true }
	return BlogModel.findOne(query, projection, {
		...defaultOptions,
		...options
	})
}

export async function findAndUpdateBlog(
	condition: FilterQuery<Blog>,
	update: UpdateQuery<Blog>,
	options: QueryOptions = {}
): Promise<Blog | null> {
	const defaultOptions = { new: true, lean: true }
	return BlogModel.findOneAndUpdate(condition, update, {
		...defaultOptions,
		...options
	})
}

export async function removeBlog(condition: FilterQuery<Comment>) {
	return BlogModel.deleteOne(condition)
}
