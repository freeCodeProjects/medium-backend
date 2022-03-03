import { FilterQuery, QueryOptions, UpdateQuery } from 'mongoose'
import ClapModel, { Clap } from '../models/clap.model'

export async function findClap(
	query: FilterQuery<Clap>,
	projection: any = '',
	options: QueryOptions = {}
): Promise<Clap | null> {
	const defaultOptions = { lean: true }
	return ClapModel.findOne(query, projection, {
		...defaultOptions,
		...options
	})
}

export async function findAndUpdateClap(
	condition: FilterQuery<Clap>,
	update: UpdateQuery<Clap>,
	options: QueryOptions = {}
): Promise<Clap | null> {
	const defaultOptions = { lean: true }
	return ClapModel.findOneAndUpdate(condition, update, {
		...defaultOptions,
		...options
	})
}
