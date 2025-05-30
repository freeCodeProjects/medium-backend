import { object, string, TypeOf } from 'zod'

const ParamWithBlogId = object({
	params: object({
		blogId: string()
	}).strict()
})

const BodyWithUsername = object({
	body: object({
		userName: string().min(3).max(60)
	}).strict()
})

export const CreateUserSchema = object({
	body: object({
		name: string({
			required_error: 'Name is required'
		})
			.min(3, {
				message: 'Name must be 3 or more characters long'
			})
			.max(50, {
				message: 'Name must be less than 50 characters long'
			}),
		email: string({ required_error: 'Email is required' }).email({
			message: 'Invalid email address'
		}),
		password: string({ required_error: 'Password is required' }).min(6, {
			message: 'Password must be 6 or more characters long'
		}),
		confirmPassword: string({ required_error: 'Password is required' }).min(6, {
			message: 'ConfirmPassword must be 6 or more characters long'
		})
	})
		.strict()
		.refine(({ password, confirmPassword }) => password === confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword']
		})
})

export const VerifyUserSchema = object({
	query: object({
		token: string({ required_error: 'Token is required' })
	}).strict()
})

export const LoginUserSchema = object({
	body: object({
		email: string({ required_error: 'Email is required' }).email({
			message: 'Invalid email address'
		}),
		password: string({ required_error: 'Password is required' })
	}).strict()
})

export const ResetPasswordMailSchema = object({
	body: object({
		email: string({ required_error: 'Email is required' }).email({
			message: 'Invalid email address'
		})
	}).strict()
})

export const ResetPasswordSchema = object({
	body: object({
		token: string(),
		password: string({ required_error: 'Password is required' }).min(6, {
			message: 'Password must be 6 or more characters long'
		}),
		confirmPassword: string({ required_error: 'Password is required' }).min(6, {
			message: 'ConfirmPassword must be 6 or more characters long'
		})
	})
		.strict()
		.refine(({ password, confirmPassword }) => password === confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword']
		})
})

export const UpdateNameSchema = object({
	body: object({
		name: string()
	}).strict()
})

export const UpdateUserBioSchema = object({
	body: object({
		bio: string().max(160)
	}).strict()
})

export const GetUserByUserNameSchema = object({
	params: object({
		userName: string()
	}).strict()
})

export const GetUserByIdSchema = object({
	params: object({
		id: string()
	}).strict()
})

export const IsUserNameUniqueSchema = object({
	query: object({
		userName: string().min(3).max(60)
	}).strict()
})

export const UpdateUserNameSchema = BodyWithUsername

export const BookmarkBlogSchema = ParamWithBlogId

export const PreviouslyReadSchema = ParamWithBlogId

export type CreateUserInput = TypeOf<typeof CreateUserSchema>['body']
export type VerifyUserQuery = TypeOf<typeof VerifyUserSchema>['query']
export type LoginUserInput = TypeOf<typeof LoginUserSchema>['body']
export type ResetPasswordMailInput = TypeOf<
	typeof ResetPasswordMailSchema
>['body']
export type ResetPasswordInput = TypeOf<typeof ResetPasswordSchema>['body']
export type UpdateNameInput = TypeOf<typeof UpdateNameSchema>['body']
export type UpdateUserBioInput = TypeOf<typeof UpdateUserBioSchema>['body']
export type IsUserNameUniqueQuery = TypeOf<
	typeof IsUserNameUniqueSchema
>['query']
export type UpdateUserNameInput = TypeOf<typeof UpdateUserNameSchema>['body']
export type BookmarkBlogParams = TypeOf<typeof BookmarkBlogSchema>['params']
export type PreviouslyReadParams = TypeOf<typeof PreviouslyReadSchema>['params']
export type GetUserByUserNameParams = TypeOf<
	typeof GetUserByUserNameSchema
>['params']
export type GetUserByIdParams = TypeOf<typeof GetUserByIdSchema>['params']
