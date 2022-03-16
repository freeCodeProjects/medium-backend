import { Request, Response } from 'express'
import { findAndUpdateClap, findClap } from '../services/clap.service'
import { logger } from '../utils/logger'
import {
	AddClapParams,
	AddClapInput,
	GetClapParams
} from '../schemas/clap.schema'

export async function addClapHandler(
	req: Request<AddClapParams, {}, AddClapInput>,
	res: Response
) {
	try {
		const { claps, relatedTo } = req.body

		const clap = await findAndUpdateClap(
			{ userId: req.user?._id, postId: req.params.postId },
			{ claps, relatedTo },
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
		const clap = await findClap({
			userId: req.user?._id,
			postId: req.params.postId
		})
		return res.status(200).send({ clap })
	} catch (e: any) {
		logger.error(`getClapHandler ${JSON.stringify(e)}`)
		return res.status(500).send(e)
	}
}
