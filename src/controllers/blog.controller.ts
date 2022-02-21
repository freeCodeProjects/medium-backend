import { Request, Response } from 'express'
import { logger } from '../utils/logger'
import {
	AddOrUpdateBlogInput,
	AddOrUpdateBlogParams
} from '../schemas/blog.schema'
import { findAllBlog, findAndUpdateBlog } from '../services/blog.service'
import { Types } from 'mongoose'
import {
	GetLatestBlogInput,
	PublishBlogParams,
	PublishBlogInput
} from '../schemas/blog.schema'
import { getReadingTime } from '../utils/helper'

const AllBlogProjection =
	'publishedTitle subTitle previewImage tags readTime publishedAt userId user'

const AllBlogUserProjection = 'name bio photo followerCount'

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
		const content = req.body.content
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
						$ifNull: ['$publishedAt', new Date().toISOString()]
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
			req.body.beforeId
				? {
						_id: { $lt: new Types.ObjectId(req.body.beforeId) },
						status: 'published'
				  }
				: { status: 'published' },
			AllBlogProjection,
			{
				sort: { publishedAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string),
				lean: true,
				populate: {
					path: 'user',
					options: {
						lean: true,
						select: AllBlogUserProjection
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
		const blogs = await findAllBlog(
			{ status: 'published' },
			AllBlogProjection,
			{
				sort: { publishedAt: -1, claps: -1 },
				limit: 6,
				lean: true,
				populate: {
					path: 'user',
					options: {
						lean: true,
						select: AllBlogUserProjection
					}
				}
			}
		)
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`GetTrendingBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
