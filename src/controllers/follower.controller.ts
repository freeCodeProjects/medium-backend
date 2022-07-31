import { Request, Response } from 'express'
import {
	addFollower,
	findAllFollower,
	findFollower,
	removeFollower
} from '../services/follower.service'
import { logger } from '../utils/logger'
import {
	AddFollowerParams,
	RemoveFollowerParams
} from '../schemas/follower.schema'
import { Types } from 'mongoose'
import { UserProjection } from '../utils/projection'
import { GetFollowerParams } from '../schemas/follower.schema'
import {
	GetFollowingOrFollowerParams,
	GetFollowingOrFollowerInput
} from '../schemas/follower.schema'

export async function getFollowerController(
	req: Request<GetFollowerParams>,
	res: Response
) {
	try {
		//id of person who is getting followed
		const followingId = new Types.ObjectId(req.params.userId)
		//id of person who is following
		const followerId = new Types.ObjectId(req.user?._id)

		const id = `follower:${followerId}-following:${followingId}`
		//add the follower to collection
		const follower = await findFollower({
			_id: id
		})

		return res.status(200).send({ isFollowing: Boolean(follower) })
	} catch (e: any) {
		logger.error(`addFollowerController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function addFollowerController(
	req: Request<AddFollowerParams>,
	res: Response
) {
	try {
		//id of person who is getting followed
		const followingId = new Types.ObjectId(req.params.userId)
		//id of person who is following
		const followerId = new Types.ObjectId(req.user?._id)

		const id = `follower:${followerId}-following:${followingId}`
		//add the follower to collection
		const follower = await addFollower({
			_id: id,
			followerId,
			followingId
		})

		return res.status(200).send({ isFollowing: Boolean(follower) })
	} catch (e: any) {
		logger.error(`addFollowerController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
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

		const id = `follower:${followerId}-following:${followingId}`
		//add the follower to collection
		await removeFollower({
			_id: id
		})

		return res.status(200).send('Unfollow successful.')
	} catch (e: any) {
		logger.error(`removeFollowerController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
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
		return res.status(500).send({ message: e.message })
	}
}
