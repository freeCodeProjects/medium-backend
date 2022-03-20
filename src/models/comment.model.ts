import { Types, Schema, model } from 'mongoose'

export interface Comment {
	_id: Types.ObjectId
	userId: Types.ObjectId | string
	postId: Types.ObjectId | string
	comment: string
	clapsCount: number
	responsesCount: number
	relatedTo: 'blog' | 'comment'
}

const CommentSchema = new Schema<Comment>(
	{
		userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
		postId: { type: Schema.Types.ObjectId, required: true },
		comment: { type: String, required: true, trim: true, minlength: 3 },
		clapsCount: { type: Number, default: 0 },
		responsesCount: { type: Number, default: 0 },
		relatedTo: { type: String, enum: ['blog', 'comment'], required: true }
	},
	{
		timestamps: true,
		toJSON: { virtuals: true },
		toObject: { virtuals: true }
	}
)

//fetch all the replies to comment
CommentSchema.virtual('replies', {
	ref: 'Comment',
	localField: '_id',
	foreignField: 'postId'
})

CommentSchema.virtual('user', {
	ref: 'User',
	justOne: true,
	localField: 'userId',
	foreignField: '_id'
})

const CommentModel = model<Comment>('Comment', CommentSchema)

export default CommentModel
