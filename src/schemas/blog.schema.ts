import { object, string, TypeOf, z } from 'zod'

export const AddOrUpdateBlogSchema = object({
	body: object({
		title: string().optional(),
		subTitle: string().optional(),
		content: object({}).optional(),
		status: z.enum(['publish', 'draft']).optional(),
		tags: string().array().optional(),
		previewImage: string().optional()
	}),
	params: object({
		id: string().optional()
	})
})

export const GetLatestBlogSchema = object({
	body: object({
		beforeId: string()
	})
})

export type AddOrUpdateBlogInput = TypeOf<typeof AddOrUpdateBlogSchema>['body']
export type AddOrUpdateBlogParams = TypeOf<
	typeof AddOrUpdateBlogSchema
>['params']
export type GetLatestBlogInput = TypeOf<typeof GetLatestBlogSchema>['body']
