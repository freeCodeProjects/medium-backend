import { number, object, preprocess, string, TypeOf } from 'zod'

export const AddBlogSchema = object({
	body: object({
		title: string().optional(),
		content: object({}).optional()
	}).strict()
})

export const UpdateBlogSchema = object({
	body: object({
		title: string().optional(),
		content: object({}).optional()
	}).strict(),
	params: object({
		id: string().optional()
	}).strict()
})

export const GetBlogByIdSchema = object({
	params: object({
		id: string()
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

export const DeleteBlogSchema = object({
	params: object({
		id: string()
	}).strict()
})

export const UploadEditorImageUrlSchema = object({
	body: object({
		url: string()
	}).strict()
})

export const EditorIframeHeightSchema = object({
	query: object({
		url: string().optional(),
		source: string().optional(),
		width: preprocess((val) => Number(val), number()).optional()
	})
})

export const EditorLinkSchema = object({
	query: object({
		url: string()
	})
})

export type AddBlogInput = TypeOf<typeof AddBlogSchema>['body']
export type UpdateBlogInput = TypeOf<typeof UpdateBlogSchema>['body']
export type UpdateBlogParams = TypeOf<typeof UpdateBlogSchema>['params']
export type PublishBlogInput = TypeOf<typeof PublishBlogSchema>['body']
export type GetBlogByIdParams = TypeOf<typeof GetBlogByIdSchema>['params']
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
export type DeleteBlogParams = TypeOf<typeof DeleteBlogSchema>['params']
export type UploadEditorImageUrlInput = TypeOf<
	typeof UploadEditorImageUrlSchema
>['body']
export type EditorIframeHeightQuery = TypeOf<
	typeof EditorIframeHeightSchema
>['query']
export type EditorLinkQuery = TypeOf<typeof EditorLinkSchema>['query']
