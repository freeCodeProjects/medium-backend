import { Request, Response } from 'express'
import BlogModel from '../models/blog.model'
import { logger } from '../utils/logger'

export async function searchBlogsController(req: Request, res: Response) {
	try {
		const docs = await BlogModel.aggregate([
			{
				$search: {
					index: 'searchBlogs',
					compound: {
						must: [
							{
								equals: {
									value: true,
									path: 'isPublished'
								}
							}
						],
						should: [
							{
								text: {
									query: req.query.q,
									path: ['publishedTitle'],
									fuzzy: {
										prefixLength: 2
									}
								}
							},
							{
								text: {
									query: req.query.q,
									path: ['tags'],
									fuzzy: {
										prefixLength: 2
									}
								}
							}
						],
						minimumShouldMatch: 1
					}
				}
			},
			{
				$project: {
					publishedTitle: 1,
					publishedContent: 1,
					subTitle: 1,
					slug: 1,
					previewImage: 1,
					tags: 1,
					readTime: 1,
					publishedAt: 1,
					userId: 1,
					clapsCount: 1,
					responsesCount: 1,
					status: 1,
					isPublished: 1,
					score: 1
				}
			},
			{
				$sort: { publishedAt: -1 }
			}
		])

		res.status(200).send(docs)
	} catch (e: any) {
		logger.error(`searchBlogsController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function autoCompleteBlogsController(req: Request, res: Response) {
	try {
		const docs = await BlogModel.aggregate([
			{
				$search: {
					index: 'autocompleteBlogs',
					autocomplete: {
						query: req.query.q,
						path: 'publishedTitle',
						tokenOrder: 'sequential'
					}
				}
			},
			{
				$match: {
					isPublished: true
				}
			},
			{
				$limit: 5
			},
			{
				$project: {
					publishedTitle: 1,
					slug: 1
				}
			}
		])

		res.status(200).send(docs)
	} catch (e: any) {
		logger.error(`autocompleteBlogsController ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}
