import { Types, Schema, model } from 'mongoose'

export interface Follower {
	_id: string
	followerId: Types.ObjectId
	followingId: Types.ObjectId
}

const FollowerSchema = new Schema<Follower>(
	{
		_id: { type: String, required: true },
		followerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		followingId: { type: Schema.Types.ObjectId, ref: 'User', required: true }
	},
	{ timestamps: true, _id: false }
)

FollowerSchema.virtual('follower', {
	ref: 'User',
	justOne: true,
	localField: 'followerId',
	foreignField: '_id'
})

FollowerSchema.virtual('following', {
	ref: 'User',
	justOne: true,
	localField: 'followingId',
	foreignField: '_id'
})

const FollowerModel = model<Follower>('Follower', FollowerSchema)

export default FollowerModel
