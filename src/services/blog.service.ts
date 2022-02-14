import { FilterQuery, UpdateQuery, QueryOptions } from 'mongoose'
import BlogModel, { Blog } from '../models/blog.model'

export async function findAndUpdateBlog(
	condition: FilterQuery<Blog>,
	update: UpdateQuery<Blog>,
	options: QueryOptions = {}
): Promise<Blog | null> {
	return BlogModel.findOneAndUpdate(condition, update, options)
}
