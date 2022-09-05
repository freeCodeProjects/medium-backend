import { Request, Response } from 'express'
import { findAndUpdateClap, findClap } from '../services/clap.service'
import { logger } from '../utils/logger'
import { AddClapInput, GetClapParams } from '../schemas/clap.schema'
import { ClapProjection } from '../utils/projection'
import { Types } from 'mongoose'
import { findBlog } from '../services/blog.service'
import { Blog } from '../models/blog.model'
import { Comment } from '../models/comment.model'
import { findComment } from '../services/comment.service'

export async function addClapHandler(
	req: Request<{}, {}, AddClapInput>,
	res: Response
) {
	try {
		const { claps: newClaps, relatedTo, postId } = req.body

		// return if there is zero new claps
		if (!newClaps) {
			return res.status(200).send('No new claps to add.')
		}

		let post: Blog | Comment | null

		if (relatedTo === 'blog') {
			post = await findBlog({ _id: postId })
		} else {
			post = await findComment({ _id: postId })
		}

		if (!post) {
			return res.status(404).send({ message: 'Post not found.' })
		}

		if (post.userId.toString() === req.user?._id.toString()) {
			return res
				.status(400)
				.send({ message: 'User cannot clap on there own post.' })
		}

		const id = `userId:${req.user?._id}-postId:${postId}`
		const clap = await findAndUpdateClap(
			{ _id: id },
			[
				{
					$set: {
						relatedTo,
						postId: new Types.ObjectId(postId),
						userId: req.user?._id,
						claps: {
							$min: [
								{
									$add: [
										{
											$cond: {
												if: '$claps',
												then: '$claps',
												else: 0
											}
										},
										newClaps
									]
								},
								50
							]
						}
					}
				}
			],
			{ upsert: true, runValidators: true, projection: ClapProjection }
		)
		return res.status(200).send(clap)
	} catch (e: any) {
		logger.error(`addClapHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getClapHandler(
	req: Request<GetClapParams>,
	res: Response
) {
	try {
		const id = `userId:${req.user?._id}-postId:${req.params.postId}`
		const clap = await findClap(
			{
				_id: id
			},
			ClapProjection
		)
		return res.status(200).send(clap)
	} catch (e: any) {
		logger.error(`getClapHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}
