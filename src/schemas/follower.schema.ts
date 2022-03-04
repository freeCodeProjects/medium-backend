import { object, string, TypeOf } from 'zod'

const ParamsWithUserId = object({
	params: object({
		userId: string()
	}).strict()
})

export const AddFollowerSchema = ParamsWithUserId
export const RemoveFollowerSchema = ParamsWithUserId

export const GetFollowingOrFollowerSchema = object({
	params: object({
		userId: string()
	}).strict(),
	body: object({
		beforeTime: string()
	}).strict()
})

export type AddFollowerParams = TypeOf<typeof AddFollowerSchema>['params']
export type RemoveFollowerParams = TypeOf<typeof RemoveFollowerSchema>['params']
export type GetFollowingOrFollowerParams = TypeOf<
	typeof GetFollowingOrFollowerSchema
>['params']
export type GetFollowingOrFollowerInput = TypeOf<
	typeof GetFollowingOrFollowerSchema
>['body']
