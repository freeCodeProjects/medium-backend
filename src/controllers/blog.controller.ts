import { Request, Response } from 'express'
import { logger } from '../utils/logger'
import {
	PublishBlogParams,
	PublishBlogInput,
	GetBlogBySlugParams,
	GetBlogByIdParams,
	AddBlogInput,
	UpdateBlogParams,
	UpdateBlogInput,
	GetUserBlogsQuery
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
import {
	EditorIframeHeightQuery,
	EditorLinkQuery
} from '../schemas/blog.schema'
const fetch = require('node-fetch')
import {
	twitterIframeHeight,
	instagramIframeHeight,
	gistIframeHeight,
	pinterestIframeHeight
} from '../utils/iframeHeight'
import { getLinkPreview } from 'link-preview-js'
import {
	GetLatestBlogQuery,
	GetUserListQuery,
	GetUserPublicBlogsQuery
} from '../schemas/blog.schema'

export async function addBlogHandler(
	req: Request<{}, {}, AddBlogInput>,
	res: Response
) {
	try {
		const blog = await addBlog({ userId: req.user?._id!, ...req.body })
		return res.status(200).send({ blog })
	} catch (e: any) {
		logger.error(`addBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
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
		return res.status(500).send({ message: e.message })
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
		return res.status(500).send({ message: e.message })
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
						$ifNull: ['$slug', generateSlug(req.body.title || 'untitled story')]
					},
					isPublished: true
				}
			}
		])
		return res.status(200).send(blog)
	} catch (e: any) {
		logger.error(`PublishBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getBlogBySlugHandler(
	req: Request<GetBlogBySlugParams>,
	res: Response
) {
	try {
		const blog = await findBlog({ slug: req.params.slug }, BlogProjection)
		if (!blog) {
			return res.status(404).send({ message: 'Blog not found.' })
		}

		return res.status(200).send(blog)
	} catch (e: any) {
		logger.error(`getBlogBySlugHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getLatestBlogHandler(
	req: Request<{}, {}, {}, GetLatestBlogQuery>,
	res: Response
) {
	try {
		const publishedAtTime = req.query.beforeTime || new Date()

		const blogs = await findAllBlog(
			{
				isPublished: true,
				publishedAt: { $lt: publishedAtTime }
			},
			BlogProjection,
			{
				sort: { publishedAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string)
			}
		)
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`GetLatestBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getTrendingBlogHandler(req: Request, res: Response) {
	try {
		const blogs = await findAllBlog({ isPublished: true }, BlogProjection, {
			sort: { clapsCount: -1, publishedAt: -1 },
			limit: 6
		})
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`GetTrendingBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getUserListHandler(
	req: Request<{}, {}, {}, GetUserListQuery>,
	res: Response
) {
	const { beforeId, type } = req.query
	try {
		const allDocs = req.user![type]
		let currDocs: Types.ObjectId[] = []

		const docCount = parseInt(
			process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string
		)

		if (!beforeId) {
			currDocs = allDocs.slice(-docCount).reverse()
		} else {
			const idx = allDocs.indexOf(new Types.ObjectId(beforeId))
			currDocs = allDocs.slice(Math.max(0, idx - docCount), idx).reverse()
		}

		const blogs = await findAllBlog({ _id: { $in: currDocs } }, BlogProjection)

		//Sort blogs by the order of their _id values in currblogs.
		blogs?.sort(function (a, b) {
			return (
				currDocs.findIndex((id) => a._id.equals(id)) -
				currDocs.findIndex((id) => b._id.equals(id))
			)
		})

		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`get${type}Handler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
	}
}

export async function getUserBlogsHandler(
	req: Request<{}, {}, {}, GetUserBlogsQuery>,
	res: Response
) {
	const beforeTime = req.query.beforeTime
	const isPublished = req.query.isPublished === 'true'
	try {
		const blogs = await findAllBlog(
			beforeTime
				? {
						userId: req.user?._id,
						isPublished,
						updatedAt: { $lt: beforeTime }
				  }
				: { userId: req.user?._id, isPublished },
			'',
			{
				sort: { updatedAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string)
			}
		)
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(
			`getUser${
				isPublished ? 'Published' : 'Draft'
			}BlogHandler, ${JSON.stringify(e)}`
		)
		return res.status(500).send({ message: e.message })
	}
}

export async function getUserPublicBlogHandler(
	req: Request<{}, {}, {}, GetUserPublicBlogsQuery>,
	res: Response
) {
	try {
		const publishedAtTime = req.query.beforeTime || new Date()
		const userId = req.query.userId

		const blogs = await findAllBlog(
			{
				userId: new Types.ObjectId(userId),
				isPublished: true,
				publishedAt: { $lt: publishedAtTime }
			},
			BlogProjection,
			{
				sort: { publishedAt: -1 },
				limit: parseInt(process.env.NUMBER_OF_DOCUMENT_PER_REQUEST as string)
			}
		)
		return res.status(200).send(blogs)
	} catch (e: any) {
		logger.error(`GetUserPublicBlogHandler ${JSON.stringify(e)}`)
		return res.status(500).send({ message: e.message })
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
		return res.status(500).send({ message: e.message })
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
		return res.status(500).send({ message: e.message })
	}
}

export async function uploadEditorImageUrlHandler(
	req: Request<{}, {}, UploadEditorImageUrlInput>,
	res: Response
) {
	try {
		const url = req.body.url

		try {
			//check if url is image type
			const isImageUrl = url.match(/https?:\/\/\S+\.(gif|jpe?g|tiff|png)$/i)
			if (!isImageUrl) {
				throw new Error('Not a image Url.')
			}

			const fileImg = await fetch(url)
				.then((r: any) => r.blob())
				.catch(() => {
					throw new Error('Incorrect file provided.')
				})

			const isImage = isFileImage(fileImg)
			if (!isImage) {
				throw new Error('File is not image.')
			}

			const isValidFileSize = validateFileSize(fileImg, 3)
			if (!isValidFileSize) {
				throw new Error('File size is more than 3 MB.')
			}
		} catch (error: any) {
			return res.status(400).send({ message: error.message })
		}

		//extract file extention from url
		let ext = url.slice(url.lastIndexOf('.') + 1)

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
		return res.status(500).send({ message: e.message })
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

export async function editorLinkHandler(
	req: Request<{}, {}, {}, EditorLinkQuery>,
	res: Response
) {
	try {
		const { url: linkUrl } = req.query
		const linkData = await getLinkPreview(linkUrl)

		if ('title' in linkData) {
			const { url, title, siteName, description, images, favicons } = linkData
			return res.status(200).send({
				success: 1,
				link: url,
				meta: {
					title,
					site_name: siteName,
					description,
					image: {
						url: images[0] || favicons[0]
					}
				}
			})
		} else {
			throw new Error('Failed to fetch link data.')
		}
	} catch (e: any) {
		logger.error(`editorLinkHandler ${e.message}`)
		return res.status(500).send({ message: e.message })
	}
}
