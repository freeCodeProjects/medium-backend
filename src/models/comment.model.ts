import { Types, Schema, model } from 'mongoose'
import { findAndUpdateBlog } from '../services/blog.service'
import { findAndUpdateComment } from '../services/comment.service'

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

CommentSchema.pre('deleteOne', async function (next) {
	//Update the response Count
	const { relatedTo, postId } = await this.model.findOne(this.getQuery())
	if (relatedTo === 'comment') {
		await findAndUpdateComment(
			{ _id: postId },
			{ $inc: { responsesCount: -1 } }
		)
	} else if (relatedTo === 'blog') {
		await findAndUpdateBlog({ _id: postId }, { $inc: { responsesCount: -1 } })
	}
	next()
})

const CommentModel = model<Comment>('Comment', CommentSchema)

export default CommentModel
