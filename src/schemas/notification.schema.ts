import { object, string, TypeOf } from 'zod'

export const GetNotificationsSchema = object({
	body: object({
		beforeTime: string()
	}).strict()
})

export type GetNotificationsInput = TypeOf<
	typeof GetNotificationsSchema
>['body']
