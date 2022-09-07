import { object, string, TypeOf } from 'zod'

export const GetNotificationsSchema = object({
	query: object({
		beforeTime: string()
	}).strict()
})

export type GetNotificationsQuery = TypeOf<
	typeof GetNotificationsSchema
>['query']
