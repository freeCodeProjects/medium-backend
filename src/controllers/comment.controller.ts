import { Request, Response } from 'express'
import {
	AddCommentInput,
	UpdateCommentParams,
	UpdateCommentInput,
	DeleteCommentParams
} from '../schemas/comment.schema'
import {
	addComment,
	findAllComment,
	findAndUpdateComment,
	removeComment
} from '../services/comment.service'
import { logger } from '../utils/logger'
import { GetCommentsQuery } from '../schemas/comment.schema'

export async function getCommentsController(
	req: Request<{}, {}, {}, GetCommentsQuery>,
	res: Response
) {
	const { postId, beforeTime, sortBy, lastClapsCount } = req.query
	try {
		const lastCreatedAtTime = beforeTime || new Date()
		//useful when sorting by "top" comments
		const minClapCount = lastClapsCount ? parseInt(lastClapsCount) : 999999999

		let query
		if (sortBy === 'top') {
			query = {
				postId,
				$or: [
					{ clapsCount: { $lt: minClapCount } },
					{ clapsCount: minClapCount, createdAt: { $lt: lastCreatedAtTime } }
				]
			}
		} else {
			query = {
				postId,
				createdAt: { $lt: lastCreatedAtTime }
			}
		}

		const comments = await findAllComment(query, '', {
			sort:
				sortBy === 'top'
					? { clapsCount: -1, createdAt: -1 }
					: { createdAt: -1 },
			limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string)
		})

		return res.status(200).send(comments)
	} catch (e: any) {
		logger.error(`get${sortBy}CommentController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function addCommentController(
	req: Request<{}, {}, AddCommentInput>,
	res: Response
) {
	try {
		await addComment({ userId: req.user?._id, ...req.body })
		res.status(200).send('comment added!')
	} catch (e: any) {
		logger.error(`addCommentController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function updateCommentController(
	req: Request<UpdateCommentParams, {}, UpdateCommentInput>,
	res: Response
) {
	try {
		const comment = await findAndUpdateComment(
			{ _id: req.params.id, userId: req.user?._id },
			{ ...req.body }
		)

		if (!comment) {
			return res.status(404).send({ message: 'Not Found.' })
		}

		return res.status(200).send('comment updated!')
	} catch (e: any) {
		logger.error(`updateCommentController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
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

		if (result.deletedCount === 0) {
			return res.status(404).send({ message: 'Not found.' })
		}

		return res.status(200).send('Comment deleted.')
	} catch (e: any) {
		logger.error(`deleteCommentController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}
