import { Request, Response } from 'express'
import {
	AddCommentInput,
	UpdateCommentParams,
	UpdateCommentInput,
	DeleteCommentParams,
	GetTopCommentInput,
	GetLatestCommentInput
} from '../schemas/comment.schema'
import {
	addComment,
	findAllComment,
	findAndUpdateComment,
	removeComment
} from '../services/comment.service'
import { logger } from '../utils/logger'
import { UserProjection } from '../utils/projection'

const LIMIT = parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string)

export async function getTopCommentController(
	req: Request<{}, {}, GetTopCommentInput>,
	res: Response
) {
	try {
		const { claps, previousId, postId } = req.body

		const comments = await findAllComment(
			previousId
				? {
						postId,
						$or: [
							{ clapsCount: { $lt: claps } },
							{ clapsCount: claps, _id: { $lt: previousId } }
						]
				  }
				: { postId },
			'',
			{
				sort: { clapsCount: -1, _id: -1 },
				limit: LIMIT,
				populate: [
					{
						path: 'user',
						select: UserProjection,
						options: {
							lean: true
						}
					},
					{
						path: 'replies',
						populate: {
							path: 'user',
							select: UserProjection,
							options: {
								lean: true
							}
						},
						options: {
							sort: { clapsCount: -1 },
							lean: true
						}
					}
				]
			}
		)

		const haveMore = comments.length === LIMIT
		return res.status(200).send({ comments, haveMore })
	} catch (e: any) {
		logger.error(`getTopCommentController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function getLatestCommentController(
	req: Request<{}, {}, GetLatestCommentInput>,
	res: Response
) {
	try {
		const { postId, beforeTime } = req.body
		const lastCreatedAtTime = beforeTime || new Date()

		const comments = await findAllComment(
			{
				postId,
				createdAt: { $lt: lastCreatedAtTime }
			},
			'',
			{
				sort: { createdAt: -1 },
				limit: LIMIT,
				populate: [
					{
						path: 'user',
						select: UserProjection,
						options: {
							lean: true
						}
					},
					{
						path: 'replies',
						populate: {
							path: 'user',
							select: UserProjection,
							options: {
								lean: true
							}
						},
						options: {
							lean: true,
							sort: { createdAt: -1 }
						}
					}
				]
			}
		)

		const haveMore = comments.length === LIMIT
		return res.status(200).send({ comments, haveMore })
	} catch (e: any) {
		logger.error(`getLatestCommentController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function addCommentController(
	req: Request<{}, {}, AddCommentInput>,
	res: Response
) {
	try {
		const comment = await addComment({ userId: req.user?._id, ...req.body })

		//@ts-ignore
		await comment.populate({
			path: 'user',
			select: UserProjection,
			options: { options: { lean: true } }
		})

		res.status(200).send({ comment })
	} catch (e: any) {
		logger.error(`addCommentController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function updateCommentController(
	req: Request<UpdateCommentParams, {}, UpdateCommentInput>,
	res: Response
) {
	try {
		const comment = await findAndUpdateComment(
			{ _id: req.params.id },
			{ ...req.body }
		)
		res.status(200).send({ comment })
	} catch (e: any) {
		logger.error(`updateCommentController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function deleteCommentController(
	req: Request<DeleteCommentParams>,
	res: Response
) {
	try {
		const result = await removeComment({
			_id: req.params.id,
			userId: req.user?._id
		})

		res.status(200).send({ result })
	} catch (e: any) {
		logger.error(`deleteCommentController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
