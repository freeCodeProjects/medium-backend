import { number, object, string, TypeOf } from 'zod'

export const GetClapSchema = object({
	params: object({
		blogId: string()
	}).strict()
})

export const AddClapSchema = object({
	body: object({
		claps: number({
			required_error: 'claps is required',
			invalid_type_error: 'claps must be a number'
		}).max(50, {
			message: 'max claps value is 50'
		})
	}).strict(),
	params: object({
		blogId: string()
	}).strict()
})

export type GetClapParams = TypeOf<typeof GetClapSchema>['params']
export type AddClapInput = TypeOf<typeof AddClapSchema>['body']
export type AddClapParams = TypeOf<typeof AddClapSchema>['params']
