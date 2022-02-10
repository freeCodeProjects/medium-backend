import express from 'express'
import { User } from '../../models/user.model'

declare global {
	namespace Express {
		interface Request {
			user?: User
			token?: string
		}
	}
}
