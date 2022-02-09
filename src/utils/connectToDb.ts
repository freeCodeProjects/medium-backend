import mongoose from 'mongoose'
import { logger } from './logger'

export const connectToDb = async () => {
	try {
		await mongoose.connect(process.env.DB_URL as string)
		logger.info('connected to Database.')
	} catch (error) {
		logger.error('Failed to connect to Database.', error)
	}
}
