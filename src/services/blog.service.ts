import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'
import BlogModel, { Blog } from '../models/blog.model'

export async function findAllBlog(
	query: FilterQuery<Blog>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Blog[] | null> {
	return BlogModel.find(query, projection, options)
}

export async function findAndUpdateBlog(
	condition: FilterQuery<Blog>,
	update: UpdateQuery<Blog>,
	options: QueryOptions = {}
): Promise<Blog | null> {
	return BlogModel.findOneAndUpdate(condition, update, options)
}
