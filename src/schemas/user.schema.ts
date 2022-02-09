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
	}).refine(({ password, confirmPassword }) => password === confirmPassword, {
		message: "Passwords don't match",
		path: ['confirmPassword']
	})
})

export type CreateUserInput = TypeOf<typeof CreateUserSchema>['body']
