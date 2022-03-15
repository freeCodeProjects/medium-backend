import { object, string, z, TypeOf, number } from 'zod'

const comment = string().min(3, 'Comment need to be 3 characters long.')
const relatedTo = z.enum(['blog', 'comment'])
const postId = string()
const previousId = string().optional()
const claps = number().optional()
const beforeTime = string()
const id = string()

export const GetTopCommentSchema = object({
	body: object({
		postId,
		previousId,
		claps
	}).strict()
})

export const GetLatestCommentSchema = object({
	body: object({
		postId,
		beforeTime
	}).strict()
})

export const AddCommentSchema = object({
	body: object({
		comment,
		postId,
		relatedTo
	}).strict()
})

export const UpdateCommentSchema = object({
	body: object({
		comment
	}).strict(),
	params: object({
		id
	}).strict()
})

export const DeleteCommentSchema = object({
	params: object({
		id
	}).strict()
})

export type GetTopCommentInput = TypeOf<typeof GetTopCommentSchema>['body']
export type GetLatestCommentInput = TypeOf<
	typeof GetLatestCommentSchema
>['body']
export type AddCommentInput = TypeOf<typeof AddCommentSchema>['body']
export type UpdateCommentInput = TypeOf<typeof UpdateCommentSchema>['body']
export type UpdateCommentParams = TypeOf<typeof UpdateCommentSchema>['params']
export type DeleteCommentParams = TypeOf<typeof DeleteCommentSchema>['params']
