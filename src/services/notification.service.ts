import { FilterQuery, QueryOptions } from 'mongoose'
import NotificationModel, { Notification } from '../models/notification.model'

export async function findAllNotifications(
	query: FilterQuery<Notification>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Notification[] | null> {
	const defaultOptions = { lean: true }
	return NotificationModel.find(query, projection, {
		...defaultOptions,
		...options
	})
}
