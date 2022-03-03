import { object, string, TypeOf } from 'zod'

export const AddFollowerSchema = object({
	params: object({
		userId: string()
	}).strict()
})

export const RemoveFollowerSchema = object({
	params: object({
		userId: string()
	}).strict()
})

export type AddFollowerInput = TypeOf<typeof AddFollowerSchema>['params']
export type RemoveFollowerInput = TypeOf<typeof RemoveFollowerSchema>['params']
