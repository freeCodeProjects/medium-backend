import { number, object, string, TypeOf, z } from 'zod'

export const GetClapSchema = object({
	params: object({
		postId: string()
	}).strict()
})

export const AddClapSchema = object({
	body: object({
		claps: number({
			required_error: 'claps is required',
			invalid_type_error: 'claps must be a number'
		}).max(50, {
			message: 'max claps value is 50'
		}),
		relatedTo: z.enum(['blog', 'comment'])
	}).strict(),
	params: object({
		postId: string()
	}).strict()
})

export type GetClapParams = TypeOf<typeof GetClapSchema>['params']
export type AddClapInput = TypeOf<typeof AddClapSchema>['body']
export type AddClapParams = TypeOf<typeof AddClapSchema>['params']
