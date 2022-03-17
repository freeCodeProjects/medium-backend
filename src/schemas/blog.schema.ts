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
		content: object({}),
		subTitle: string().optional(),
		tags: string().array().optional(),
		previewImage: string().optional()
	}).strict(),
	params: object({
		id: string()
	}).strict()
})

export const GetBlogBySlugSchema = object({
	params: object({
		slug: string()
	}).strict()
})

export const GetLatestBlogSchema = object({
	body: object({
		beforeTime: string()
	}).strict()
})

export const GetBookMarkOrPreviouslyReadSchema = object({
	body: object({
		beforeId: string()
	}).strict()
})

export const GetUserDraftBlogSchema = object({
	body: object({
		beforeTime: string()
	}).strict()
})

export const GetUserPublishedBlogSchema = object({
	body: object({
		beforeTime: string()
	}).strict()
})

export type AddOrUpdateBlogInput = TypeOf<typeof AddOrUpdateBlogSchema>['body']
export type AddOrUpdateBlogParams = TypeOf<
	typeof AddOrUpdateBlogSchema
>['params']
export type PublishBlogInput = TypeOf<typeof PublishBlogSchema>['body']
export type PublishBlogParams = TypeOf<typeof PublishBlogSchema>['params']
export type GetLatestBlogInput = TypeOf<typeof GetLatestBlogSchema>['body']
export type GetBlogBySlugParams = TypeOf<typeof GetBlogBySlugSchema>['params']
export type GetBookMarkOrPreviouslyReadInput = TypeOf<
	typeof GetBookMarkOrPreviouslyReadSchema
>['body']
export type GetUserDraftBlogInput = TypeOf<
	typeof GetUserDraftBlogSchema
>['body']
export type GetUserPublishedBlogInput = TypeOf<
	typeof GetUserPublishedBlogSchema
>['body']
