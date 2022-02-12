import { model, Schema, Types } from 'mongoose'
import bcrypt from 'bcryptjs'
import { logger } from '../utils/logger'
import { nanoid } from 'nanoid'

export interface User {
	_id: Types.ObjectId
	email: string
	name: string
	userName: string
	password: string
	photo: string
	verified: boolean
	notification: number
	tokens: string[]
	verificationId?: string
	bio?: string
	followers?: Types.ObjectId[]
	following?: Types.ObjectId[]
	previouslyRead?: Types.ObjectId[]
	bookmarks?: Types.ObjectId[]
	comparePassword(candidatePassword: string): Promise<Boolean>
	save(): Promise<User>
}

const UserSchema = new Schema<User>(
	{
		name: { type: String, required: true, trim: true },
		email: { type: String, required: true, trim: true, unique: true },
		userName: { type: String, required: true, trim: true, unique: true },
		password: { type: String, required: true, minlength: 6, trim: true },
		photo: { type: String, required: true, trim: true },
		verified: { type: Boolean, required: true, default: false },
		verificationId: { type: String, default: () => nanoid() },
		bio: { type: String, trim: true },
		notification: { type: Number, default: 0 },
		followers: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		following: [{ type: Schema.Types.ObjectId, ref: 'User' }],
		previouslyRead: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
		bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
		tokens: [{ token: { type: String, required: true } }]
	},
	{ timestamps: true }
)

UserSchema.virtual('blogs', {
	ref: 'Blog',
	localField: '_id',
	foreignField: 'userId'
})

UserSchema.methods.comparePassword = async function (
	candidatePassword: string
): Promise<boolean> {
	const user = this
	return bcrypt.compare(candidatePassword, user.password).catch((e) => {
		logger.error('error compare password', e)
		return false
	})
}

UserSchema.methods.toJSON = function () {
	const user = this
	const userObject = user.toObject()

	delete userObject.password
	delete userObject.verificationId
	delete userObject.verified
	delete userObject.__v
	delete userObject.tokens
	return userObject
}

UserSchema.pre('save', async function (next) {
	const user = this
	if (user.isModified('password')) {
		user.password = await bcrypt
			.hash(user.password, parseInt(process.env.SALT_WORK_FACTOR as string))
			.catch((e) => {
				logger.error('error hashing password', e)
				return e
			})
	}
	next()
})

const UserModel = model<User>('User', UserSchema)

export default UserModel
