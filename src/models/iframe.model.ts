import { Types, Schema, model } from 'mongoose'

export interface Iframe {
	_id: Types.ObjectId
	userId: Types.ObjectId
	url: string
	height: number
	slope: number
	yIntersection: number
	source: string
	createdAt: Date
	updatedAt: Date
}

const IframeSchema = new Schema<Iframe>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User' },
		url: { type: String, required: true, unique: true },
		height: { type: Number },
		slope: { type: Number },
		yIntersection: { type: Number },
		source: { type: String, required: true }
	},
	{ timestamps: true }
)

IframeSchema.virtual('user', {
	ref: 'User',
	localField: 'userId',
	foreignField: '_id',
	justOne: true
})

const IframeModel = model<Iframe>('Iframe', IframeSchema)

export default IframeModel
