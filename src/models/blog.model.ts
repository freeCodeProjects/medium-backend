import { model, Schema, Types } from 'mongoose'

export interface Blog {
	_id: Types.ObjectId
	title: string
	publishedTitle: string
	subTitle: string
	content: object
	publishedContent: object
	status: 'draft' | 'published'
	tags: string[]
	userId: Types.ObjectId
	previewImage: string
	clapsCount: number
	responsesCount: number
	publishedAt: Date
	readTime: number
}

const BlogSchema = new Schema<Blog>(
	{
		title: { type: String, default: 'untitled story', trim: true },
		publishedTitle: { type: String, default: 'untitled story', trim: true },
		subTitle: { type: String, default: '', trim: true },
		content: { type: Map, default: '' },
		publishedContent: { type: Map, default: '' },
		status: { type: String, default: 'draft' },
		tags: [{ type: String, trim: true }],
		userId: { type: Schema.Types.ObjectId, required: true, ref: 'User' },
		previewImage: { type: String, trim: true, default: '' },
		clapsCount: { type: Number, default: 0 },
		responsesCount: { type: Number, default: 0 },
		publishedAt: { type: Date },
		readTime: { type: Number, default: 0 }
	},
	{ timestamps: true }
)

BlogSchema.virtual('user', {
	ref: 'User',
	justOne: true,
	localField: 'userId',
	foreignField: '_id'
})

const BlogModel = model<Blog>('Blog', BlogSchema)

export default BlogModel
