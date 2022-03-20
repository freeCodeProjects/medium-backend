import { Types, Schema, model } from 'mongoose'

export interface Notification {
	_id: string
	userId: Types.ObjectId
	ownerId: Types.ObjectId
	message: string
	action: 'follow' | 'comment' | 'clap'
	createdAt: Date
	updatedAt: Date
}

const NotificationSchema = new Schema<Notification>(
	{
		_id: { type: String, required: true },
		userId: { type: Schema.Types.ObjectId, required: true },
		ownerId: { type: Schema.Types.ObjectId, required: true },
		message: { type: String },
		action: { type: String, enum: ['follow', 'comment', 'clap'] }
	},
	{ timestamps: true, _id: false }
)

NotificationSchema.virtual('user', {
	ref: 'User',
	localField: 'userId',
	foreignField: '_id',
	justOne: true
})

const NotificationModel = model<Notification>(
	'Notification',
	NotificationSchema
)

export default NotificationModel
