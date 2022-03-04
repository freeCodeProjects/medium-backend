import { Request, Response } from 'express'
import {
	addFollower,
	findAllFollower,
	removeFollower
} from '../services/follower.service'
import { logger } from '../utils/logger'
import {
	AddFollowerParams,
	RemoveFollowerParams
} from '../schemas/follower.schema'
import { Types } from 'mongoose'
import { findAndUpdateUser } from '../services/user.service'
import { UserProjection } from '../utils/projection'
import {
	GetFollowingOrFollowerParams,
	GetFollowingOrFollowerInput
} from '../schemas/follower.schema'

export async function addFollowerController(
	req: Request<AddFollowerParams>,
	res: Response
) {
	try {
		//id of person who is getting followed
		const followingId = new Types.ObjectId(req.params.userId)
		//id of person who is following
		const followerId = new Types.ObjectId(req.user?._id)

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
			{ projection: `${UserProjection} bookmarks` }
		)

		return res.status(200).send({ follower, following })
	} catch (e: any) {
		logger.error(`addFollowerController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function removeFollowerController(
	req: Request<RemoveFollowerParams>,
	res: Response
) {
	try {
		//id of person who is getting followed
		const followingId = new Types.ObjectId(req.params.userId)
		//id of person who is following
		const followerId = new Types.ObjectId(req.user?._id)

		//add the follower to collection
		await removeFollower({
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
			{ projection: `${UserProjection} bookmarks` }
		)

		return res.status(200).send({ follower, following })
	} catch (e: any) {
		logger.error(`removeFollowerController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function getFollowingOrFollowerHandler(
	req: Request<GetFollowingOrFollowerParams, {}, GetFollowingOrFollowerInput>,
	res: Response
) {
	try {
		const { userId } = req.params
		const query = req.path.includes('followers')
			? { followingId: userId }
			: { followerId: userId }

		const path = req.path.includes('followers') ? 'follower' : 'following'

		const result = await findAllFollower(
			req.body.beforeTime
				? {
						...query,
						createdAt: { $lt: req.body.beforeTime }
				  }
				: query,
			'',
			{
				sort: { createdAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string),
				lean: true,
				populate: {
					path,
					select: UserProjection,
					options: { lean: true }
				}
			}
		)
		return res.status(200).send({ result })
	} catch (e: any) {
		logger.error(`getFollowingOrFollowerHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
