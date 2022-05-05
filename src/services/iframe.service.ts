import { FilterQuery, QueryOptions } from 'mongoose'
import IframeModel, { Iframe } from '../models/iframe.model'

export async function addIframe(input: Partial<Iframe>): Promise<Iframe> {
	return IframeModel.create(input)
}

export async function findIframe(
	query: FilterQuery<Iframe>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Iframe | null> {
	const defaultOptions = { lean: true }
	return IframeModel.findOne(query, projection, {
		...defaultOptions,
		...options
	})
}
