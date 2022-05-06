import { Request, Response } from 'express'
import { logger } from '../utils/logger'
import {
	GetLatestBlogInput,
	PublishBlogParams,
	PublishBlogInput,
	GetBookMarkOrPreviouslyReadInput,
	GetUserPublishedBlogInput,
	GetUserDraftBlogInput,
	GetBlogBySlugParams,
	GetBlogByIdParams,
	AddBlogInput,
	UpdateBlogParams,
	UpdateBlogInput
} from '../schemas/blog.schema'
import {
	addBlog,
	findAllBlog,
	findAndUpdateBlog,
	findBlog,
	removeBlog
} from '../services/blog.service'
import { Types } from 'mongoose'
import {
	getReadingTime,
	generateSlug,
	isFileImage,
	validateFileSize
} from '../utils/helper'
import { BlogProjection, UserProjection } from '../utils/projection'
import {
	DeleteBlogParams,
	UploadEditorImageUrlInput
} from '../schemas/blog.schema'
import { imageUploader } from '../utils/fileUploader'
import { nanoid } from 'nanoid'
import { EditorIframeHeightQuery } from '../schemas/blog.schema'
const fetch = require('node-fetch')
import {
	twitterIframeHeight,
	instagramIframeHeight,
	gistIframeHeight,
	pinterestIframeHeight
} from '../utils/iframeHeight'

export async function addBlogHandler(
	req: Request<{}, {}, AddBlogInput>,
	res: Response
) {
	try {
		const blog = await addBlog({ userId: req.user?._id!, ...req.body })
		return res.status(200).send({ blog })
	} catch (e: any) {
		logger.error(`addBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function updateBlogHandler(
	req: Request<UpdateBlogParams, {}, UpdateBlogInput>,
	res: Response
) {
	try {
		const blog = await findAndUpdateBlog(
			{ _id: req.params.id, userId: req.user?._id },
			{ ...req.body }
		)
		return res.status(200).send({ blog })
	} catch (e: any) {
		logger.error(`updateBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function getBlogByIdHandler(
	req: Request<GetBlogByIdParams>,
	res: Response
) {
	try {
		const blog = await findBlog({ _id: req.params.id, userId: req.user?._id })

		if (!blog) {
			return res.status(404).send({ message: 'Blog not found.' })
		}

		return res.status(200).send({ blog })
	} catch (e: any) {
		logger.error(`getBlogByIdHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function publishBlogHandler(
	req: Request<PublishBlogParams, {}, PublishBlogInput>,
	res: Response
) {
	try {
		const id = req.params.id
		const readTime = getReadingTime(req.body.content)

		//Work around for MongoServerError: Invalid $set :: caused by :: an empty object is not a valid value.
		req.body.content = { $literal: req.body.content }

		const blog = await findAndUpdateBlog({ _id: id, userId: req.user?._id }, [
			{
				$set: {
					...req.body,
					readTime,
					publishedTitle: req.body.title,
					publishedContent: req.body.content,
					status: 'published',
					publishedAt: {
						$ifNull: ['$publishedAt', new Date()]
					},
					slug: {
						$ifNull: [generateSlug(req.body.title), '$slug']
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

export async function getBlogBySlugHandler(
	req: Request<GetBlogBySlugParams>,
	res: Response
) {
	try {
		const blog = await findBlog({ slug: req.params.slug }, BlogProjection)
		return res.status(200).send(blog)
	} catch (e: any) {
		logger.error(`getBlogBySlugHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function getLatestBlogHandler(
	req: Request<{}, {}, GetLatestBlogInput>,
	res: Response
) {
	try {
		const publishedAtTime = req.body.beforeTime || new Date()

		const blogs = await findAllBlog(
			{
				status: 'published',
				publishedAt: { $lt: publishedAtTime }
			},
			BlogProjection,
			{
				sort: { publishedAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string),
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

export async function getTrendingBlogHandler(req: Request, res: Response) {
	try {
		const blogs = await findAllBlog({ status: 'published' }, BlogProjection, {
			sort: { claps: -1, publishedAt: -1 },
			limit: 6,
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
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string)
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
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string)
			}
		)
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`getUserPublishedBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function deleteBlogController(
	req: Request<DeleteBlogParams>,
	res: Response
) {
	try {
		const result = await removeBlog({
			_id: req.params.id,
			userId: req.user?._id
		})

		res.status(200).send({ result })
	} catch (e: any) {
		logger.error(`deleteBlogController ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function uploadEditorImageFileHandler(
	req: Request,
	res: Response
) {
	try {
		const { originalname: name, buffer: file } = req.file!
		const result = await imageUploader(file, name, 'editor')

		return res.status(200).send({
			success: 1,
			file: {
				url: result.url
			}
		})
	} catch (e: any) {
		logger.error(`uploadEditorImageFileHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function uploadEditorImageUrlHandler(
	req: Request<{}, {}, UploadEditorImageUrlInput>,
	res: Response
) {
	try {
		const url = req.body.url
		let ext = ''
		try {
			const fileImg = await fetch(url)
				.then((r: any) => r.blob())
				.catch(() => {
					throw new Error('Incorrect file provided.')
				})

			const isImage = isFileImage(fileImg)
			if (!isImage) {
				throw new Error('File is not image.')
			}

			ext = fileImg.type.split('/')[1]

			const isValidFileSize = validateFileSize(fileImg, 3)
			if (!isValidFileSize) {
				throw new Error('File size is more than 3 MB.')
			}
		} catch (error: any) {
			return res.status(400).send({ message: error.message })
		}

		const result = await imageUploader(
			req.body.url,
			nanoid() + '.' + ext,
			'editor'
		)

		return res.status(200).send({
			success: 1,
			file: {
				url: result.url
			}
		})
	} catch (e: any) {
		logger.error(`uploadEditorImageUrlHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function editorIframeHeightHandler(
	req: Request<{}, {}, {}, EditorIframeHeightQuery>,
	res: Response
) {
	try {
		const { url, source, width } = req.query
		logger.info(`${source}, ${url}, ${width}`)

		if (url && source === 'gist') {
			const height = await gistIframeHeight(url, req.user)
			return res.status(200).send({ height })
		} else if (url && source === 'instagram') {
			const height = await instagramIframeHeight(url, width!, req.user)
			return res.status(200).send({ height })
		} else if (url && source === 'twitter') {
			const height = await twitterIframeHeight(url, width!, req.user)
			return res.status(200).send({ height })
		} else if (url && source === 'pinterest') {
			const height = await pinterestIframeHeight(url, width!, req.user)
			return res.status(200).send({ height })
		}
	} catch (e: any) {
		logger.error(`editorIframeHeightHandler ${e.message}`)
		return res.status(500).send({ message: e.message })
	}
}
