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
	claps: number
	commentCount: number
	publishedAt: Date
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
		userId: { type: Schema.Types.ObjectId, required: true },
		previewImage: { type: String, trim: true, default: '' },
		claps: { type: Number, default: 0 },
		commentCount: { type: Number, default: 0 },
		publishedAt: { type: Date }
	},
	{ timestamps: true }
)

const BlogModel = model<Blog>('Blog', BlogSchema)

export default BlogModel
