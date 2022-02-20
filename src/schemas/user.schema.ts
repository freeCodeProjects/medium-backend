import { object, string, TypeOf } from 'zod'

export const CreateUserSchema = object({
	body: object({
		name: string({
			required_error: 'Name is required'
		}),
		email: string({ required_error: 'Email is required' }).email({
			message: 'Invalid email address'
		}),
		password: string({ required_error: 'Password is required' }).min(6, {
			message: 'Must be 6 or more characters long'
		}),
		confirmPassword: string({ required_error: 'Password is required' }).min(6, {
			message: 'Must be 6 or more characters long'
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
		password: string({ required_error: 'Password is required' }).min(6, {
			message: 'Must be 6 or more characters long'
		})
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
			message: 'Must be 6 or more characters long'
		}),
		confirmPassword: string({ required_error: 'Password is required' }).min(6, {
			message: 'Must be 6 or more characters long'
		})
	})
		.strict()
		.refine(({ password, confirmPassword }) => password === confirmPassword, {
			message: "Passwords don't match",
			path: ['confirmPassword']
		})
})

export const UpdateUserNameSchema = object({
	body: object({
		name: string()
	}).strict()
})

export const UpdateUserBioSchema = object({
	body: object({
		bio: string().min(6).max(160)
	}).strict()
})

export type CreateUserInput = TypeOf<typeof CreateUserSchema>['body']
export type VerifyUserInput = TypeOf<typeof VerifyUserSchema>['query']
export type LoginUserInput = TypeOf<typeof LoginUserSchema>['body']
export type ResetPasswordMailInput = TypeOf<
	typeof ResetPasswordMailSchema
>['body']
export type ResetPasswordInput = TypeOf<typeof ResetPasswordSchema>['body']
export type UpdateUserNameInput = TypeOf<typeof UpdateUserNameSchema>['body']
export type UpdateUserBioInput = TypeOf<typeof UpdateUserBioSchema>['body']
