import { Schema, Types, model } from 'mongoose'

export interface Clap {
	_id: Types.ObjectId
	userId: Types.ObjectId
	blogId: Types.ObjectId
	claps: number
}

const ClapSchema = new Schema<Clap>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		blogId: { type: Schema.Types.ObjectId, ref: 'Blog', required: true },
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
