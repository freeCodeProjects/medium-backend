import { Request, Response } from 'express'
import { findAndUpdateClap, findClap } from '../services/clap.service'
import { logger } from '../utils/logger'
import {
	AddClapParams,
	AddClapInput,
	GetClapParams
} from '../schemas/clap.schema'

export async function addClapHandler(
	req: Request<{}, {}, AddClapInput>,
	res: Response
) {
	try {
		const { claps, relatedTo, postId } = req.body

		const id = `userId:${req.user?._id}-postId:${postId}`
		const clap = await findAndUpdateClap(
			{ _id: id },
			{ claps, relatedTo, postId, userId: req.user?._id },
			{ upsert: true, runValidators: true }
		)
		return res.status(200).send({ clap })
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
		const id = `userId:${req.user?._id}-postId:${req.params.postId}`
		const clap = await findClap({
			_id: id
		})
		return res.status(200).send({ clap })
	} catch (e: any) {
		logger.error(`getClapHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
