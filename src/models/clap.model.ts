import { Schema, Types, model } from 'mongoose'

export interface Clap {
	_id: Types.ObjectId
	userId: Types.ObjectId
	postId: Types.ObjectId
	claps: number
	relatedTo: 'blog' | 'comment'
}

const ClapSchema = new Schema<Clap>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		postId: { type: Schema.Types.ObjectId, required: true },
		relatedTo: { type: String, enum: ['blog', 'comment'], required: true },
		claps: {
			type: Number,
			required: true,
			default: 0,
			max: 50
		}
	},
	{ timestamps: true }
)

const ClapModel = model<Clap>('Clap', ClapSchema)

export default ClapModel
