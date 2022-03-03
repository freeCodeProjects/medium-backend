import { Request, Response } from 'express'
import { findAndUpdateClap, findClap } from '../services/clap.service'
import { logger } from '../utils/logger'
import {
	AddClapParams,
	AddClapInput,
	GetClapParams
} from '../schemas/clap.schema'
import { findAndUpdateBlog } from '../services/blog.service'

export async function addClapHandler(
	req: Request<AddClapParams, {}, AddClapInput>,
	res: Response
) {
	try {
		const clap = await findAndUpdateClap(
			{ userId: req.user?._id, blogId: req.params.blogId },
			{ claps: req.body.claps },
			{ upsert: true, runValidators: true }
		)
		//update claps count in blog
		const newClaps = clap ? req.body.claps - clap!.claps : req.body.claps
		const blog = await findAndUpdateBlog(
			{ _id: req.params.blogId },
			{ $inc: { claps: newClaps } }
		)
		return res.status(200).send(blog)
	} catch (e: any) {
		logger.error(`addClapHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}

export async function getClapHandler(
	req: Request<GetClapParams>,
	res: Response
) {
	try {
		const clap = await findClap({
			userId: req.user?._id,
			blogId: req.params.blogId
		})
		return res.status(200).send(clap)
	} catch (e: any) {
		logger.error(`getClapHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
