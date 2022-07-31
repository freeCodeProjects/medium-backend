import FollowerModel, { Follower } from '../models/follower.model'
import { FilterQuery, QueryOptions } from 'mongoose'

export async function findFollower(
	query: FilterQuery<Follower>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Follower | null> {
	const defaultOptions = { lean: true }
	return FollowerModel.findOne(query, projection, {
		...defaultOptions,
		...options
	})
}

export async function addFollower(input: Partial<Follower>): Promise<Follower> {
	return FollowerModel.create({ ...input })
}

export async function removeFollower(input: Partial<Follower>) {
	return FollowerModel.deleteOne({ ...input })
}

export async function findAllFollower(
	query: FilterQuery<Follower>,
	projection?: any,
	options: QueryOptions = {}
): Promise<Follower[] | null> {
	const defaultOptions = { lean: true }
	return FollowerModel.find(query, projection, {
		...defaultOptions,
		...options
	})
}
