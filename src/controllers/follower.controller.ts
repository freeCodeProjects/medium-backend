import { Request, Response } from 'express'
import { addFollower } from '../services/follower.service'
import { logger } from '../utils/logger'
import { AddFollowerInput } from '../schemas/follower.schema'
import { Types } from 'mongoose'
import { findAndUpdateUser } from '../services/user.service'
import { UserProjection } from '../utils/projection'

export async function addFollowerController(
	req: Request<AddFollowerInput>,
	res: Response
) {
	try {
		//id of person who is following
		const followerId = new Types.ObjectId(req.params.userId)
		//id of person getting followed
		const followingId = new Types.ObjectId(req.user?._id)

		//add the follower to collection
		await addFollower({
			followerId,
			followingId
		})

		//update the follower count
		const following = await findAndUpdateUser(
			{ _id: followingId },
			{ $inc: { followerCount: 1 } },
			{ projection: UserProjection }
		)

		//update the following count
		const follower = await findAndUpdateUser(
			{ _id: followerId },
			{ $inc: { followingCount: 1 } },
			{ projection: UserProjection }
		)

		return res.status(200).send({ follower, following })
	} catch (e: any) {
		logger.error(`addFollowerController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function removeFollowerController(
	req: Request<AddFollowerInput>,
	res: Response
) {
	try {
		//id of person who is following
		const followerId = new Types.ObjectId(req.params.userId)
		//id of person getting followed
		const followingId = new Types.ObjectId(req.user?._id)

		//add the follower to collection
		await addFollower({
			followerId,
			followingId
		})

		//update the follower count
		const following = await findAndUpdateUser(
			{ _id: followingId },
			{ $inc: { followerCount: -1 } },
			{ projection: UserProjection }
		)

		//update the following count
		const follower = await findAndUpdateUser(
			{ _id: followerId },
			{ $inc: { followingCount: -1 } },
			{ projection: UserProjection }
		)

		return res.status(200).send({ follower, following })
	} catch (e: any) {
		logger.error(`addFollowerController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
