import { Request, Response } from 'express'
import { logger } from '../utils/logger'
import {
	AddOrUpdateBlogInput,
	AddOrUpdateBlogParams,
	GetLatestBlogInput,
	PublishBlogParams,
	PublishBlogInput,
	GetBookMarkOrPreviouslyReadInput,
	GetUserPublishedBlogInput,
	GetUserDraftBlogInput
} from '../schemas/blog.schema'
import { findAllBlog, findAndUpdateBlog } from '../services/blog.service'
import { Types } from 'mongoose'
import { getReadingTime } from '../utils/helper'
import { BlogProjection, UserProjection } from '../utils/projection'

export async function AddOrUpdateBlogHandler(
	req: Request<AddOrUpdateBlogParams, {}, AddOrUpdateBlogInput>,
	res: Response
) {
	try {
		//generate a new id in case it is not supplied
		const id = req.params.id || new Types.ObjectId()
		const blog = await findAndUpdateBlog(
			{ _id: id },
			{ ...req.body, userId: req.user?._id },
			{ upsert: true }
		)
		return res.status(200).send(blog)
	} catch (e: any) {
		logger.error(`AddOrUpdateBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function PublishBlogHandler(
	req: Request<PublishBlogParams, {}, PublishBlogInput>,
	res: Response
) {
	try {
		const id = req.params.id
		const readTime = getReadingTime(req.body.content)

		//Work around for MongoServerError: Invalid $set :: caused by :: an empty object is not a valid value.
		req.body.content = { $literal: req.body.content }

		const blog = await findAndUpdateBlog({ _id: id }, [
			{
				$set: {
					...req.body,
					readTime,
					publishedTitle: req.body.title,
					publishedContent: req.body.content,
					userId: req.user?._id,
					status: 'published',
					publishedAt: {
						$ifNull: ['$publishedAt', new Date()]
					}
				}
			}
		])
		return res.status(200).send(blog)
	} catch (e: any) {
		logger.error(`PublishBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function GetLatestBlogHandler(
	req: Request<{}, {}, GetLatestBlogInput>,
	res: Response
) {
	try {
		const blogs = await findAllBlog(
			req.body.beforeTime
				? {
						status: 'published',
						publishedAt: { $lt: req.body.beforeTime }
				  }
				: { status: 'published' },
			BlogProjection,
			{
				sort: { publishedAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string),
				lean: true,
				populate: {
					path: 'user',
					options: {
						lean: true,
						select: UserProjection
					}
				}
			}
		)
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`GetLatestBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function GetTrendingBlogHandler(req: Request, res: Response) {
	try {
		const blogs = await findAllBlog({ status: 'published' }, BlogProjection, {
			sort: { claps: -1, publishedAt: -1 },
			limit: 6,
			lean: true,
			populate: {
				path: 'user',
				options: {
					lean: true,
					select: UserProjection
				}
			}
		})
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`GetTrendingBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function getBookMarkOrPreviouslyReadHandler(
	req: Request<{}, {}, GetBookMarkOrPreviouslyReadInput>,
	res: Response
) {
	let type: 'bookmarks' | 'previouslyRead' = 'bookmarks'
	try {
		if (req.path.includes('PreviouslyRead')) {
			type = 'previouslyRead'
		}

		const { beforeId } = req.body
		const allDocs = req.user![type]
		let currDocs: Types.ObjectId[] = []

		const docCount = parseInt(
			process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string
		)

		//get last 2 bookmarks in reverse order
		if (!beforeId) {
			currDocs = allDocs.slice(-docCount).reverse()
		} else {
			const idx = allDocs.indexOf(new Types.ObjectId(beforeId))
			currDocs = allDocs.slice(Math.max(0, idx - docCount), idx).reverse()
		}

		const docs = await findAllBlog({ _id: { $in: currDocs } }, BlogProjection, {
			lean: true,
			populate: {
				path: 'user',
				options: {
					lean: true,
					select: UserProjection
				}
			}
		})

		//Sort docs by the order of their _id values in currDocs.
		docs?.sort(function (a, b) {
			return (
				currDocs.findIndex((id) => a._id.equals(id)) -
				currDocs.findIndex((id) => b._id.equals(id))
			)
		})

		return res.status(200).send(docs)
	} catch (e: any) {
		logger.error(`get${type}Handler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function getUserDraftBlogHandler(
	req: Request<{}, {}, GetUserDraftBlogInput>,
	res: Response
) {
	try {
		const blogs = await findAllBlog(
			req.body.beforeTime
				? {
						userId: req.user?._id,
						status: 'draft',
						updatedAt: { $lt: req.body.beforeTime }
				  }
				: { userId: req.user?._id, status: 'draft' },
			BlogProjection,
			{
				sort: { updatedAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string),
				lean: true
			}
		)
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`getUserDraftBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function getUserPublishedBlogHandler(
	req: Request<{}, {}, GetUserPublishedBlogInput>,
	res: Response
) {
	try {
		const blogs = await findAllBlog(
			req.body.beforeTime
				? {
						userId: req.user?._id,
						status: 'published',
						publishedAt: { $lt: req.body.beforeTime }
				  }
				: { userId: req.user?._id, status: 'published' },
			BlogProjection,
			{
				sort: { publishedAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string),
				lean: true
			}
		)
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`getUserPublishedBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
