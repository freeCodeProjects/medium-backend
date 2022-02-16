import { object, string, TypeOf } from 'zod'

export const AddOrUpdateBlogSchema = object({
	body: object({
		title: string().optional(),
		content: object({}).optional()
	}).strict(),
	params: object({
		id: string().optional()
	}).strict()
})

export const PublishBlogSchema = object({
	body: object({
		title: string(),
		subTitle: string().optional(),
		content: object({}).optional(),
		tags: string().array().optional(),
		previewImage: string().optional()
	}).strict(),
	params: object({
		id: string()
	}).strict()
})

export const GetLatestBlogSchema = object({
	body: object({
		beforeId: string().optional()
	}).strict()
})

export type AddOrUpdateBlogInput = TypeOf<typeof AddOrUpdateBlogSchema>['body']
export type AddOrUpdateBlogParams = TypeOf<
	typeof AddOrUpdateBlogSchema
>['params']
export type PublishBlogInput = TypeOf<typeof PublishBlogSchema>['body']
export type PublishBlogParams = TypeOf<typeof PublishBlogSchema>['params']
export type GetLatestBlogInput = TypeOf<typeof GetLatestBlogSchema>['body']
