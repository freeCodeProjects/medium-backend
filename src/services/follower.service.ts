import FollowerModel, { Follower } from '../models/follower.model'

export function addFollower(input: Partial<Follower>): Promise<Follower> {
	return FollowerModel.create({ ...input })
}

export function removeFollower(input: Partial<Follower>) {
	return FollowerModel.deleteOne({ ...input })
}
