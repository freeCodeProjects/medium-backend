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
	newNotificationCount: number
	tokens: { token: string }[]
	verificationId: string
	bio: string
	followerCount: number
	followingCount: number
	previouslyRead: Types.ObjectId[]
	bookmarks: Types.ObjectId[]
	__v: number
	createdAt: Date
	updatedAt: Date
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
		bio: { type: String, trim: true, default: '' },
		newNotificationCount: { type: Number, default: 0 },
		followerCount: { type: Number, default: 0 },
		followingCount: { type: Number, default: 0 },
		previouslyRead: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
		bookmarks: [{ type: Schema.Types.ObjectId, ref: 'Blog' }],
		tokens: [{ token: { type: String, required: true } }]
	},
	{ timestamps: true }
)

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
	return transformDoc(userObject)
}

//delete secret or not required key when lean is enabled
UserSchema.post(['findOne', 'findOneAndUpdate', 'find'], function (res) {
	if (!res || !this.mongooseOptions().lean) {
		return
	}
	if (Array.isArray(res)) {
		res.forEach(transformDoc)
		return
	}
	transformDoc(res)
})

function transformDoc(doc: Partial<User>) {
	delete doc.password
	delete doc.verificationId
	delete doc.verified
	delete doc.tokens
	delete doc.__v
	delete doc.createdAt
	delete doc.updatedAt
	return doc
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
